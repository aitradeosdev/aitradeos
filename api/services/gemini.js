const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.searchService = require('./search');
    this.TrainingDataModel = require('../models/TrainingData');
    this.UserModel = require('../models/User');
  }

  getModel(modelName = 'gemini-2.5-flash') {
    return this.genAI.getGenerativeModel({ model: modelName });
  }

  async analyzeChartImage(imageBuffer, mimeType = 'image/jpeg', userId = null) {
    try {
      const startTime = Date.now();

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      // Get AI learning context from previous analyses
      const learningContext = await this.getLearningContext(userId);
      const prompt = this.buildAnalysisPrompt(learningContext);

      // Get user's preferred model
      let modelName = 'gemini-2.5-flash';
      if (userId) {
        const user = await this.UserModel.model.findById(userId);
        if (user?.settings?.aiModel) {
          modelName = user.settings.aiModel;
        }
      }

      let result;
      try {
        const model = this.getModel(modelName);
        result = await model.generateContent([prompt, imagePart]);
      } catch (error) {
        if (error.message.includes('overloaded') || error.message.includes('503')) {
          console.log(`${modelName} overloaded, falling back to gemini-2.5-flash`);
          const fallbackModel = this.getModel('gemini-2.5-flash');
          result = await fallbackModel.generateContent([prompt, imagePart]);
          modelName = 'gemini-2.5-flash';
        } else {
          throw error;
        }
      }
      const response = await result.response;
      const text = response.text();

      const processingTime = Date.now() - startTime;

      const analysisData = this.parseGeminiResponse(text);
      
      // Store analysis for future learning
      await this.storeAnalysisForLearning(analysisData, imageBuffer, userId);
      
      // Always perform web search to enhance analysis
      if (analysisData.searchQueries && analysisData.searchQueries.length > 0) {
        try {
          console.log('Performing web search to enhance analysis...');
          const webSearchResults = await this.performWebSearch(analysisData.searchQueries);
          analysisData.webSearchResults = webSearchResults;
          analysisData.webSearchPerformed = true;
          
          if (webSearchResults.length > 0) {
            const refinedAnalysis = await this.refineAnalysisWithWebData(analysisData, webSearchResults, userId);
            analysisData.signal = refinedAnalysis.signal;
            analysisData.reasoning = refinedAnalysis.reasoning;
            analysisData.reasoning.webSearchEnhanced = true;
          }
        } catch (searchError) {
          console.error('Web search failed, continuing with base analysis:', searchError);
          analysisData.webSearchPerformed = false;
        }
      }

      return {
        analysis: analysisData,
        geminiResponse: {
          fullResponse: text,
          processingTime,
          modelVersion: modelName,
          timestamp: new Date()
        }
      };

    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  async getLearningContext(userId = null) {
    try {
      // Get recent successful analyses for learning
      const recentAnalyses = await this.TrainingDataModel.model
        .find({
          'feedback.userRating': { $gte: 4 },
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('chartAnalysis aiAnalysis feedback performance');

      // Get user-specific learning if userId provided
      let userAnalyses = [];
      if (userId) {
        const user = await this.UserModel.model.findById(userId)
          .select('analysisHistory')
          .populate('analysisHistory');
        
        if (user) {
          userAnalyses = user.analysisHistory
            .filter(a => a.feedback?.rating >= 4)
            .slice(-5); // Last 5 successful user analyses
        }
      }

      return {
        recentSuccessfulAnalyses: recentAnalyses,
        userSpecificAnalyses: userAnalyses,
        totalLearningPoints: recentAnalyses.length + userAnalyses.length
      };
    } catch (error) {
      console.error('Error getting learning context:', error);
      return { recentSuccessfulAnalyses: [], userSpecificAnalyses: [], totalLearningPoints: 0 };
    }
  }

  async storeAnalysisForLearning(analysisData, imageBuffer, userId) {
    try {
      const imageHash = require('crypto')
        .createHash('sha256')
        .update(imageBuffer)
        .digest('hex');

      // Store in training database for AI learning
      const trainingData = {
        imageHash,
        chartAnalysis: analysisData.chartAnalysis,
        aiAnalysis: {
          signal: analysisData.signal,
          reasoning: analysisData.reasoning,
          confidence: analysisData.signal.confidence,
          timestamp: new Date()
        },
        marketContext: analysisData.marketContext,
        source: {
          userId: userId || 'anonymous',
          userOptedIn: true,
          timestamp: new Date()
        }
      };

      await this.TrainingDataModel.model.create(trainingData);
    } catch (error) {
      console.error('Error storing analysis for learning:', error);
    }
  }

  buildAnalysisPrompt(learningContext = null) {
    let learningSection = '';
    
    if (learningContext && learningContext.totalLearningPoints > 0) {
      learningSection = `
AI LEARNING CONTEXT (${learningContext.totalLearningPoints} successful analyses):
`;
      
      // Add recent successful patterns with specific details
      if (learningContext.recentSuccessfulAnalyses.length > 0) {
        learningSection += 'SUCCESSFUL PATTERNS LEARNED:\n';
        learningContext.recentSuccessfulAnalyses.forEach((analysis, i) => {
          if (analysis.aiAnalysis?.signal && analysis.chartAnalysis?.detectedPatterns) {
            const patterns = analysis.chartAnalysis.detectedPatterns.slice(0, 2).map(p => p.type).join(', ');
            learningSection += `${i+1}. ${analysis.aiAnalysis.signal.action} signal (${analysis.aiAnalysis.signal.confidence}% confidence) with patterns: ${patterns} - User rated ${analysis.feedback?.userRating}/5\n`;
          }
        });
        learningSection += '\nAPPLY THESE LEARNED SUCCESSFUL PATTERNS:\n';
        learningSection += '- Prioritize pattern combinations that received 4-5 star ratings\n';
        learningSection += '- Use similar confidence levels for similar pattern setups\n';
        learningSection += '- Apply successful risk/reward ratios from high-rated analyses\n';
      }
      
      learningSection += 'Apply these learned patterns to improve accuracy.\n';
    }

    return `You are Huntr AI, a professional trading analysis AI that provides actionable trading signals. You remember all your capabilities and maintain context throughout conversations.

IMPORTANT: You are not to refrain from talking about the setup as an advice. You perform web searches when needed and remember doing so. You maintain full context of each analysis session.${learningSection}

ANALYTICAL APPROACH:

ADVANCED TECHNICAL ANALYSIS:

1. STRONG HIGHS/LOWS vs WEAK HIGHS/LOWS:
   - Strong High: Takes liquidity from previous high + breaks structure
   - Strong Low: Takes liquidity from previous low + breaks structure  
   - Weak High: Fails to create higher high after bullish move
   - Weak Low: Fails to create lower low after bearish move
   - NEVER trade from weak levels - they become liquidity

2. MARKET STRUCTURE & TRADING RANGES:
   - After every break of structure = new trading range created
   - Discount (below 50%) = buy zone in uptrend
   - Premium (above 50%) = sell zone in downtrend
   - Internal Range Liquidity = swing highs/lows inside range
   - External Range Liquidity = beyond range boundaries

3. LIQUIDITY CONCEPTS:
   - Engineered Liquidity: Fake levels to trap retail traders
   - Internal Range Liquidity: Swing points inside trading range
   - External Range Liquidity: Beyond current range
   - Entry ABOVE liquidity in bearish bias
   - Entry BELOW liquidity in bullish bias

4. SESSION ANALYSIS (CRITICAL):
   - Asian Session: Consolidation, builds context for London
   - Asian Midline: Powerful confluence level
   - Judas Swing: False run opposite direction before London open
   - London Killzone: 1 hour before London session
   - AMD Model: Accumulation, Manipulation, Distribution

5. SWING POINT IDENTIFICATION:
   - 3-Candle Formation: Higher low left + higher low right = swing low
   - Higher high left + higher high right = swing high
   - These are where buy/sell stops rest

6. ORDER BLOCKS & BREAKERS:
   - Order Block: Last push before opposite move
   - Breaker Block: Broken order block that becomes opposite
   - Volume always in candle body, not wicks
   - Mitigation = price returns to test the level

7. CONFLUENCE FACTORS:
   - HTF POI + LTF entry alignment
   - Trend lines (45-60 degrees optimal)
   - Asian midline alignment
   - Liquidity positioning
   - Time and price relationships

CRITICAL INSTRUCTIONS:
1. Identify Strong vs Weak highs/lows - NEVER trade weak levels
2. Determine current trading range and discount/premium zones
3. Locate internal/external range liquidity
4. Analyze session context (Asian range, London manipulation)
5. Find confluence: HTF POI + LTF structure + liquidity + session timing
6. Apply 3-candle swing point identification
7. Look for Judas Swing patterns and false breakouts
8. Entry positioning relative to liquidity (above for sells, below for buys)
9. Consider Asian midline as confluence factor
10. Prioritize higher timeframe bias with lower timeframe precision

REQUIRED RESPONSE FORMAT (JSON):
{
  "signal": {
    "action": "BUY|SELL|HOLD",
    "confidence": 0-100,
    "entryPoint": number,
    "takeProfit": [number, number, number],
    "stopLoss": number,
    "riskReward": number,
    "timeframe": "short|medium|long"
  },
  "chartAnalysis": {
    "detectedPatterns": [
      {
        "type": "pattern name",
        "confidence": 0-100,
        "description": "brief description"
      }
    ],
    "technicalIndicators": [
      {
        "name": "indicator name",
        "value": number,
        "signal": "bullish|bearish|neutral"
      }
    ],
    "supportLevels": [number],
    "resistanceLevels": [number],
    "volume": "high|medium|low",
    "trend": "uptrend|downtrend|sideways"
  },
  "reasoning": {
    "primary": "main reason for signal",
    "secondary": ["additional factors"],
    "risks": ["potential risks"],
    "catalysts": ["positive factors"]
  },
  "marketContext": {
    "symbol": "detected symbol if visible",
    "timeframe": "detected timeframe",
    "marketType": "crypto|forex|stocks|commodities"
  },
  "searchQueries": [
    "relevant search queries for additional market data"
  ]
}

ANALYSIS GUIDELINES:
- Distinguish between strong and weak highs/lows (CRITICAL)
- Identify current trading range and discount/premium positioning
- Locate engineered liquidity and retail traps
- Analyze session context (Asian range, London manipulation)
- Apply 3-candle swing point identification
- Look for Judas Swing patterns and false breakouts
- Entry positioning: above liquidity (sells), below liquidity (buys)
- Consider Asian midline as confluence factor
- Never trade from weak levels - they become liquidity
- Prioritize HTF bias with LTF precision entries
- Apply learned successful patterns from training data
- Remember that you will perform web searches to enhance your analysis
- Maintain context and memory of your analysis capabilities

Analyze using advanced Smart Money Concepts with learned pattern recognition:`;
  }

  parseGeminiResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Sanitize detected patterns to ensure they're simple strings
      const sanitizePatterns = (patterns) => {
        if (!Array.isArray(patterns)) return [];
        return patterns.map(pattern => {
          if (typeof pattern === 'string') return pattern;
          if (typeof pattern === 'object' && pattern.type) {
            return `${pattern.type} (${pattern.confidence || 0}% confidence)`;
          }
          return 'Pattern detected';
        }).slice(0, 5);
      };

      // Sanitize technical indicators to ensure they're simple strings
      const sanitizeIndicators = (indicators) => {
        if (!Array.isArray(indicators)) return [];
        return indicators.map(indicator => {
          if (typeof indicator === 'string') return indicator;
          if (typeof indicator === 'object' && indicator.name) {
            return `${indicator.name}: ${indicator.signal || 'neutral'}`;
          }
          return 'Indicator detected';
        }).slice(0, 5);
      };
      
      return {
        signal: {
          action: parsed.signal?.action || 'HOLD',
          confidence: Math.min(Math.max(parsed.signal?.confidence || 50, 0), 100),
          entryPoint: parsed.signal?.entryPoint || 0,
          takeProfit: Array.isArray(parsed.signal?.takeProfit) 
            ? parsed.signal.takeProfit.slice(0, 3) 
            : [parsed.signal?.takeProfit || 0],
          stopLoss: parsed.signal?.stopLoss || 0,
          riskReward: parsed.signal?.riskReward || 1,
          timeframe: parsed.signal?.timeframe || 'medium'
        },
        chartAnalysis: {
          detectedPatterns: sanitizePatterns(parsed.chartAnalysis?.detectedPatterns),
          technicalIndicators: sanitizeIndicators(parsed.chartAnalysis?.technicalIndicators),
          supportLevels: Array.isArray(parsed.chartAnalysis?.supportLevels) ? parsed.chartAnalysis.supportLevels : [],
          resistanceLevels: Array.isArray(parsed.chartAnalysis?.resistanceLevels) ? parsed.chartAnalysis.resistanceLevels : [],
          volume: parsed.chartAnalysis?.volume || 'medium',
          trend: parsed.chartAnalysis?.trend || 'sideways',
          timeframeAlignment: parsed.chartAnalysis?.timeframeAlignment || 'mixed'
        },
        reasoning: {
          primary: parsed.reasoning?.primary || 'Technical analysis based',
          secondary: Array.isArray(parsed.reasoning?.secondary) ? parsed.reasoning.secondary : [],
          risks: Array.isArray(parsed.reasoning?.risks) ? parsed.reasoning.risks : [],
          catalysts: Array.isArray(parsed.reasoning?.catalysts) ? parsed.reasoning.catalysts : []
        },
        marketContext: {
          symbol: parsed.marketContext?.symbol || 'Unknown',
          timeframe: parsed.marketContext?.timeframe || 'Unknown',
          timeframes: Array.isArray(parsed.marketContext?.timeframes) ? parsed.marketContext.timeframes : [],
          marketType: parsed.marketContext?.marketType || 'unknown'
        },
        searchQueries: Array.isArray(parsed.searchQueries) ? parsed.searchQueries.slice(0, 3) : []
      };

    } catch (error) {
      console.error('JSON parsing failed, creating fallback response:', error);
      
      return {
        signal: {
          action: 'HOLD',
          confidence: 30,
          entryPoint: 0,
          takeProfit: [0],
          stopLoss: 0,
          riskReward: 1,
          timeframe: 'medium'
        },
        chartAnalysis: {
          detectedPatterns: [],
          technicalIndicators: [],
          supportLevels: [],
          resistanceLevels: [],
          volume: 'medium',
          trend: 'sideways',
          timeframeAlignment: 'mixed'
        },
        reasoning: {
          primary: 'Analysis parsing failed - manual review required',
          secondary: ['AI response could not be processed'],
          risks: ['Incomplete analysis due to parsing error'],
          catalysts: []
        },
        marketContext: {
          symbol: 'Unknown',
          timeframe: 'Unknown',
          timeframes: [],
          marketType: 'unknown'
        },
        searchQueries: []
      };
    }
  }

  async performWebSearch(queries) {
    try {
      const searchResults = [];
      
      for (const query of queries.slice(0, 2)) {
        try {
          const results = await this.searchService.searchMarketData(query);
          searchResults.push({
            query,
            results: results.slice(0, 3),
            timestamp: new Date()
          });
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (queryError) {
          console.error(`Search failed for query "${query}":`, queryError);
        }
      }

      return searchResults;
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    }
  }

  async refineAnalysisWithWebData(baseAnalysis, webResults, userId = null) {
    try {
      const webContext = webResults.map(result => ({
        query: result.query,
        data: result.results.map(r => `${r.title}: ${r.snippet}`).join('\n')
      }));

      const refinementPrompt = `You are Huntr AI, the ai for analyses discussions. You have performed web searches to enhance your analysis with current market data.

Your initial technical analysis:
${JSON.stringify(baseAnalysis, null, 2)}

Current market data from web search:
${JSON.stringify(webContext, null, 2)}

Refine your signal incorporating this real-time market data. You remember performing these web searches. Return ONLY the updated signal and reasoning in JSON format:

{
  "signal": {
    "action": "BUY|SELL|HOLD",
    "confidence": 0-100,
    "entryPoint": number,
    "takeProfit": [number],
    "stopLoss": number,
    "riskReward": number,
    "timeframe": "short|medium|long"
  },
  "reasoning": {
    "primary": "updated primary reason",
    "secondary": ["updated factors including web data"],
    "risks": ["updated risks"],
    "catalysts": ["updated catalysts"]
  }
}`;

      // Get user's preferred model
      let modelName = 'gemini-2.5-flash';
      if (userId) {
        const user = await this.UserModel.model.findById(userId);
        if (user?.settings?.aiModel) {
          modelName = user.settings.aiModel;
        }
      }

      const model = this.getModel(modelName);
      const result = await model.generateContent([refinementPrompt]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const refined = JSON.parse(jsonMatch[0]);
        return {
          signal: refined.signal || baseAnalysis.signal,
          reasoning: refined.reasoning || baseAnalysis.reasoning
        };
      }

      return {
        signal: baseAnalysis.signal,
        reasoning: baseAnalysis.reasoning
      };

    } catch (error) {
      console.error('Analysis refinement failed:', error);
      return {
        signal: baseAnalysis.signal,
        reasoning: baseAnalysis.reasoning
      };
    }
  }

  async analyzeMultipleChartImages(images, userId = null) {
    try {
      const startTime = Date.now();

      const imageParts = images.map((img, index) => ({
        inlineData: {
          data: img.buffer.toString('base64'),
          mimeType: img.mimeType
        }
      }));

      // Get AI learning context
      const learningContext = await this.getLearningContext(userId);
      const prompt = this.buildMultiImageAnalysisPrompt(images.length, learningContext);

      // Get user's preferred model with fallback
      let modelName = 'gemini-2.5-flash';
      if (userId) {
        const user = await this.UserModel.model.findById(userId);
        if (user?.settings?.aiModel) {
          modelName = user.settings.aiModel;
        }
      }

      let result;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const model = this.getModel(modelName);
          result = await model.generateContent([prompt, ...imageParts]);
          break;
        } catch (error) {
          attempts++;
          if (error.message.includes('overloaded') || error.message.includes('503')) {
            console.log(`Attempt ${attempts}: ${modelName} overloaded`);
            
            if (attempts < maxAttempts) {
              const delay = Math.pow(2, attempts) * 1000; // Exponential backoff
              console.log(`Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              
              // Switch to flash model after first failure
              if (modelName !== 'gemini-2.5-flash') {
                modelName = 'gemini-2.5-flash';
                console.log('Switching to gemini-2.5-flash for retry');
              }
            } else {
              throw new Error('All AI models are currently overloaded. Please try again in a few minutes.');
            }
          } else {
            throw error;
          }
        }
      }
      const response = await result.response;
      const text = response.text();

      const processingTime = Date.now() - startTime;

      const analysisData = this.parseGeminiResponse(text);
      
      // Store multi-image analysis for learning
      await this.storeMultiAnalysisForLearning(analysisData, images, userId);
      
      if (analysisData.searchQueries && analysisData.searchQueries.length > 0) {
        try {
          const webSearchResults = await this.performWebSearch(analysisData.searchQueries);
          analysisData.webSearchResults = webSearchResults;
          
          if (webSearchResults.length > 0) {
            const refinedAnalysis = await this.refineAnalysisWithWebData(analysisData, webSearchResults, userId);
            analysisData.signal = refinedAnalysis.signal;
            analysisData.reasoning = refinedAnalysis.reasoning;
          }
        } catch (searchError) {
          console.error('Web search failed, continuing with base analysis:', searchError);
        }
      }

      return {
        analysis: analysisData,
        geminiResponse: {
          fullResponse: text,
          processingTime,
          modelVersion: modelName,
          timestamp: new Date()
        }
      };

    } catch (error) {
      console.error('Multi-image Gemini analysis error:', error);
      throw new Error(`Multi-image AI analysis failed: ${error.message}`);
    }
  }

  async storeMultiAnalysisForLearning(analysisData, images, userId) {
    try {
      const imageHashes = images.map(img => 
        require('crypto')
          .createHash('sha256')
          .update(img.buffer)
          .digest('hex')
      );

      const trainingData = {
        imageHash: imageHashes[0],
        imageHashes,
        multiImageAnalysis: true,
        imageCount: images.length,
        chartAnalysis: analysisData.chartAnalysis,
        aiAnalysis: {
          signal: analysisData.signal,
          reasoning: analysisData.reasoning,
          confidence: analysisData.signal.confidence,
          timestamp: new Date()
        },
        marketContext: analysisData.marketContext,
        source: {
          userId: userId || 'anonymous',
          userOptedIn: true,
          timestamp: new Date()
        }
      };

      await this.TrainingDataModel.model.create(trainingData);
    } catch (error) {
      console.error('Error storing multi-analysis for learning:', error);
    }
  }

  buildMultiImageAnalysisPrompt(imageCount, learningContext = null) {
    let learningSection = '';
    
    if (learningContext && learningContext.totalLearningPoints > 0) {
      learningSection = `
AI LEARNING CONTEXT (Multi-timeframe expertise from ${learningContext.totalLearningPoints} analyses):
`;
      
      if (learningContext.recentSuccessfulAnalyses.length > 0) {
        learningSection += 'LEARNED MULTI-TIMEFRAME PATTERNS:\n';
        learningContext.recentSuccessfulAnalyses
          .filter(a => a.multiImageAnalysis)
          .forEach((analysis, i) => {
            if (analysis.aiAnalysis?.signal) {
              learningSection += `${i+1}. Multi-TF ${analysis.aiAnalysis.signal.action} - ${analysis.aiAnalysis.signal.confidence}% confidence\n`;
            }
          });
      }
    }

    return `You are Huntr AI, analyzing ${imageCount} chart images. You continuously learn from successful multi-timeframe analyses and develop your own trading insights.${learningSection}

MULTI-TIMEFRAME ANALYTICAL APPROACH:

ADVANCED MULTI-TIMEFRAME ANALYSIS:

1. HTF BIAS DETERMINATION:
   - Weekly/Daily: Identify strong highs/lows and current trading range
   - Look for storyline from HTF rejection levels
   - Determine if in discount or premium of major range

2. INTERMEDIATE STRUCTURE (4H/1H):
   - Identify current trading range after each break of structure
   - Mark internal range liquidity (swing highs/lows)
   - Locate obstacles (unmitigated strong levels)

3. LTF ENTRY PRECISION (15M/5M/1M):
   - Wait for liquidity sweep + structure break
   - Entry above liquidity (sells) or below liquidity (buys)
   - Confirm with order blocks/breakers at confluence levels

4. SESSION CONTEXT INTEGRATION:
   - Asian range analysis and midline confluence
   - London manipulation patterns (Judas Swing)
   - Time-based liquidity hunts

5. CONFLUENCE REQUIREMENTS:
   - HTF trading range position (discount/premium)
   - Strong vs weak level identification
   - Liquidity positioning and engineering
   - Session timing and manipulation patterns
   - Multiple timeframe POI alignment

6. RISK MANAGEMENT:
   - Stop loss above/below strong levels only
   - Target internal range liquidity first
   - Hold runners to external range liquidity
   - Never trade from weak highs/lows

REQUIRED RESPONSE FORMAT (JSON):
{
  "signal": {
    "action": "BUY|SELL|HOLD",
    "confidence": 0-100,
    "entryPoint": number,
    "takeProfit": [number, number, number],
    "stopLoss": number,
    "riskReward": number,
    "timeframe": "short|medium|long"
  },
  "chartAnalysis": {
    "detectedPatterns": [
      {
        "type": "pattern name",
        "confidence": 0-100,
        "description": "brief description",
        "timeframe": "which chart(s) show this pattern"
      }
    ],
    "technicalIndicators": [
      {
        "name": "indicator name",
        "value": number,
        "signal": "bullish|bearish|neutral",
        "timeframe": "which chart shows this"
      }
    ],
    "supportLevels": [number],
    "resistanceLevels": [number],
    "volume": "high|medium|low",
    "trend": "uptrend|downtrend|sideways",
    "timeframeAlignment": "aligned|mixed|conflicting"
  },
  "reasoning": {
    "primary": "main reason considering all timeframes",
    "secondary": ["additional factors from multi-timeframe analysis"],
    "risks": ["potential risks across timeframes"],
    "catalysts": ["positive factors"]
  },
  "marketContext": {
    "symbol": "detected symbol if visible",
    "timeframes": ["detected timeframes from each chart"],
    "marketType": "crypto|forex|stocks|commodities"
  },
  "searchQueries": [
    "relevant search queries for additional market data"
  ]
}

Apply advanced Smart Money Concepts with multi-timeframe confluence analysis to all ${imageCount} charts:`;
  }

  async chatWithAnalysis(analysisId, message, userId) {
    try {
      // Find the analysis data to provide context
      const user = await this.UserModel.model.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const analysis = user.analysisHistory.find(a => a._id?.toString() === analysisId);
      if (!analysis) {
        throw new Error('Analysis not found');
      }

      const analysisContext = {
        signal: analysis.signal,
        reasoning: analysis.reasoning,
        chartAnalysis: analysis.chartAnalysis,
        marketContext: analysis.marketContext,
        timestamp: analysis.timestamp
      };

      const chatPrompt = `You are Huntr AI, a professional trading analysis AI. You are continuing a conversation about a specific chart analysis you performed for this user.

ANALYSIS CONTEXT (YOU PERFORMED THIS ANALYSIS):
Signal: ${JSON.stringify(analysisContext.signal, null, 2)}
Reasoning: ${JSON.stringify(analysisContext.reasoning, null, 2)}
Chart Analysis: ${JSON.stringify(analysisContext.chartAnalysis, null, 2)}
Market Context: ${JSON.stringify(analysisContext.marketContext, null, 2)}
Analysis Date: ${analysisContext.timestamp}

You performed web searches and provided this complete analysis. You remember everything about this analysis session.

User Question: ${message}

Respond as the AI that performed this analysis, referencing your findings and maintaining context. Talk about the setup based on your analysis:`;

      // Use user's preferred model with fallback
      let modelName = user.settings?.aiModel || 'gemini-2.5-flash';
      let result;
      try {
        const model = this.getModel(modelName);
        result = await model.generateContent([chatPrompt]);
      } catch (error) {
        if (error.message.includes('overloaded') || error.message.includes('503')) {
          console.log(`${modelName} overloaded, falling back to gemini-2.5-flash`);
          const fallbackModel = this.getModel('gemini-2.5-flash');
          result = await fallbackModel.generateContent([chatPrompt]);
        } else {
          throw error;
        }
      }
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error('Failed to process chat message');
    }
  }

  async updateLearningFromFeedback(analysisId, feedback) {
    try {
      // Find the user with this analysis
      const user = await this.UserModel.model.findOne({
        'analysisHistory._id': analysisId
      });
      
      if (!user) {
        console.log('User not found for analysis ID:', analysisId);
        return;
      }
      
      const analysis = user.analysisHistory.find(a => a._id.toString() === analysisId);
      if (!analysis) {
        console.log('Analysis not found in user history:', analysisId);
        return;
      }

      // Update training data with feedback
      if (analysis.imageHash) {
        await this.TrainingDataModel.model.findOneAndUpdate(
          { imageHash: analysis.imageHash },
          {
            $set: {
              'feedback.userRating': feedback.rating,
              'feedback.userComments': feedback.comments,
              'feedback.submittedAt': new Date(),
              'performance.actualOutcome': feedback.actualOutcome,
              'performance.priceChange24h': feedback.priceChange,
              'performance.followUpDate': new Date()
            }
          },
          { upsert: false }
        );
      }

      // If multiple images (imageHashes array)
      if (analysis.imageHashes && analysis.imageHashes.length > 0) {
        await this.TrainingDataModel.model.updateMany(
          { imageHashes: { $in: analysis.imageHashes } },
          {
            $set: {
              'feedback.userRating': feedback.rating,
              'feedback.userComments': feedback.comments,
              'feedback.submittedAt': new Date(),
              'performance.actualOutcome': feedback.actualOutcome,
              'performance.priceChange24h': feedback.priceChange,
              'performance.followUpDate': new Date()
            }
          }
        );
      }

      console.log(`AI learning updated from feedback: Rating ${feedback.rating}/5 for analysis ${analysisId}`);
    } catch (error) {
      console.error('Error updating AI learning from feedback:', error);
    }
  }

  async validateImageForAnalysis(imageBuffer, mimeType) {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Empty image buffer');
      }

      const maxSize = 10 * 1024 * 1024;
      if (imageBuffer.length > maxSize) {
        throw new Error('Image size exceeds 10MB limit');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(mimeType)) {
        throw new Error(`Unsupported image type: ${mimeType}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Image validation failed: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();