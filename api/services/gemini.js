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
      
      // PHASE 4: Lower Timeframe Entry Refinement
      if (analysisData.signal.action !== 'HOLD') {
        try {
          console.log('Phase 4: Refining entry with lower timeframe precision...');
          const refinedEntry = await this.refineLowerTimeframeEntry(analysisData, imagePart, modelName);
          if (refinedEntry) {
            analysisData.signal.entryPoint = refinedEntry.entryPoint;
            analysisData.signal.stopLoss = refinedEntry.stopLoss;
            analysisData.signal.takeProfit = refinedEntry.takeProfit;
            analysisData.entryRefinement = {
              refined: true,
              originalEntry: analysisData.signal.entryPoint,
              refinedEntry: refinedEntry.entryPoint,
              refinementReason: refinedEntry.reason
            };
          }
        } catch (refinementError) {
          console.error('Entry refinement failed:', refinementError);
        }
      }
      
      // Store analysis for future learning
      await this.storeAnalysisForLearning(analysisData, imageBuffer, userId);
      
      // PHASE 2: Advanced Multi-Phase Web Search Enhancement
      try {
        console.log('Phase 2: Performing advanced web search analysis...');
        const comprehensiveSearchResults = await this.performAdvancedWebSearch(analysisData, userId);
        analysisData.webSearchResults = comprehensiveSearchResults;
        analysisData.webSearchPerformed = true;
        
        if (comprehensiveSearchResults.length > 0) {
          console.log('Phase 3: Refining analysis with comprehensive market intelligence...');
          const refinedAnalysis = await this.refineAnalysisWithWebData(analysisData, comprehensiveSearchResults, userId);
          analysisData.signal = refinedAnalysis.signal;
          analysisData.reasoning = refinedAnalysis.reasoning;
          analysisData.reasoning.webSearchEnhanced = true;
        }
      } catch (searchError) {
        console.error('Advanced web search failed, continuing with base analysis:', searchError);
        analysisData.webSearchPerformed = false;
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

  buildAnalysisPrompt(learningContext = null, webContext = null, isSecondPass = false) {
    let learningSection = '';
    
    if (learningContext && learningContext.totalLearningPoints > 0) {
      learningSection = `\nAI LEARNING CONTEXT (${learningContext.totalLearningPoints} successful analyses):\n`;
      
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

    let webSection = '';
    if (webContext && webContext.length > 0) {
      webSection = `\nREAL-TIME MARKET INTELLIGENCE:\n${JSON.stringify(webContext, null, 2)}\n\nCRITICAL: Use this market data to validate your technical analysis. If fundamentals contradict technicals, reduce confidence significantly.\n`;
    }

    let passSection = '';
    if (isSecondPass) {
      passSection = `\nSECOND PASS ANALYSIS - ENHANCED PRECISION:\nYou have already performed web search and initial analysis. Now apply the market intelligence to refine your technical analysis with extreme precision. Focus on confluence validation and risk mitigation.\n`;
    }

    return `You are Huntr AI, an elite institutional-grade trading analysis AI. You NEVER trade against the primary trend. You provide only high-probability setups with multiple confluence factors.${learningSection}${webSection}${passSection}

ELITE INSTITUTIONAL ANALYSIS FRAMEWORK:

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

ELITE TRADING RULES (NEVER VIOLATE):
1. NEVER TRADE AGAINST PRIMARY TREND - If HTF is bullish, ONLY BUY signals allowed. If HTF bearish, ONLY SELL signals allowed
2. MINIMUM 4 CONFLUENCE FACTORS required for any signal (increased from 3)
3. Strong levels ONLY - Weak levels = automatic HOLD
4. Risk/Reward minimum 1:4 or HOLD (increased from 1:3)
5. Market structure must be intact - No broken structure trades
6. Liquidity positioning is MANDATORY - Above for sells, below for buys
7. Session timing confluence required
8. Volume confirmation essential
9. Fundamental alignment with technicals
10. Multiple timeframe agreement (HTF bias + MTF structure + LTF entry)
11. CONSISTENCY CHECK: Never give opposite signals within 2 hours for same symbol
12. CONFIDENCE THRESHOLD: Minimum 75% confidence or automatic HOLD

CONFLUENCE REQUIREMENTS (Need 4+ for signal):
- HTF trend alignment (MANDATORY)
- Strong level rejection/retest (MANDATORY)
- Liquidity sweep + structure break
- Order block/breaker confluence
- Session timing (London/NY overlap)
- Volume spike confirmation
- Fibonacci confluence (61.8%, 78.6%)
- Previous structure alignment
- Fundamental catalyst support
- Market sentiment alignment
- Price action confirmation
- Momentum alignment

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

INSTITUTIONAL ANALYSIS PROTOCOL:
1. PRIMARY TREND IDENTIFICATION (MANDATORY):
   - Weekly/Daily bias determines trade direction
   - NEVER counter-trend - If HTF bullish, only BUY signals
   - Trend strength: Strong (multiple confirmations) vs Weak (single confirmation)

2. MULTI-TIMEFRAME CONFLUENCE MATRIX:
   - HTF: Trend direction + key levels
   - MTF: Structure breaks + ranges
   - LTF: Precise entries + liquidity

3. ADVANCED LIQUIDITY MAPPING:
   - External Range Liquidity (ERL): Beyond current range
   - Internal Range Liquidity (IRL): Swing points inside range
   - Engineered Liquidity: Fake levels for retail traps
   - Liquidity Voids: Areas of low volume/interest

4. INSTITUTIONAL ORDER FLOW:
   - Accumulation: Smart money building positions
   - Manipulation: False moves to trigger stops
   - Distribution: Smart money exiting positions

5. SESSION-BASED PRECISION:
   - Asian Session: Range building, midline significance
   - London Killzone: Major moves, manipulation
   - NY Session: Trend continuation/reversal
   - Overlap periods: Highest probability setups

6. RISK MANAGEMENT MATRIX:
   - Position sizing based on confluence count
   - Stop loss ONLY at strong levels
   - Take profits at logical resistance/support
   - Trail stops using structure breaks

CRITICAL RULES:
- If fewer than 4 confluence factors exist, output HOLD regardless of setup quality
- NEVER give BUY signal if HTF trend is bearish
- NEVER give SELL signal if HTF trend is bullish
- If trend is unclear or sideways, default to HOLD
- Minimum 75% confidence or HOLD
- Risk/Reward must be 1:4 or better

Analyze with institutional precision - retail setups are forbidden:`;
  }

  parseGeminiResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Enhanced validation for institutional-grade analysis
      const validateSignal = (signal) => {
        if (!signal) return { action: 'HOLD', confidence: 0, reason: 'No signal provided' };
        
        // Force HOLD if confidence below institutional threshold (increased to 75%)
        if ((signal.confidence || 0) < 75) {
          return { ...signal, action: 'HOLD', confidence: signal.confidence || 0, reason: 'Below institutional confidence threshold (75%)' };
        }
        
        // Validate risk/reward ratio (increased to 1:4)
        if ((signal.riskReward || 0) < 4) {
          return { ...signal, action: 'HOLD', confidence: Math.max((signal.confidence || 0) - 30, 0), reason: 'Insufficient risk/reward ratio (minimum 1:4)' };
        }
        
        // Check confluence count (minimum 4)
        const confluenceCount = this.countConfluenceFactors(parsed);
        if (confluenceCount < 4) {
          return { ...signal, action: 'HOLD', confidence: Math.max((signal.confidence || 0) - 40, 0), reason: `Insufficient confluence factors (${confluenceCount}/4 minimum)` };
        }
        
        // Prevent counter-trend signals
        if (parsed.chartAnalysis?.trend) {
          const trend = parsed.chartAnalysis.trend.toLowerCase();
          if (trend === 'uptrend' && signal.action === 'SELL') {
            return { ...signal, action: 'HOLD', confidence: 0, reason: 'Counter-trend signal rejected - HTF uptrend detected' };
          }
          if (trend === 'downtrend' && signal.action === 'BUY') {
            return { ...signal, action: 'HOLD', confidence: 0, reason: 'Counter-trend signal rejected - HTF downtrend detected' };
          }
        }
        
        return signal;
      };
      
      const sanitizePatterns = (patterns) => {
        if (!Array.isArray(patterns)) return [];
        return patterns.map(pattern => {
          if (typeof pattern === 'string') return pattern;
          if (typeof pattern === 'object' && pattern.type) {
            return `${pattern.type} (${pattern.confidence || 0}% confidence)`;
          }
          return 'Pattern detected';
        }).slice(0, 8);
      };

      const sanitizeIndicators = (indicators) => {
        if (!Array.isArray(indicators)) return [];
        return indicators.map(indicator => {
          if (typeof indicator === 'string') return indicator;
          if (typeof indicator === 'object' && indicator.name) {
            return `${indicator.name}: ${indicator.signal || 'neutral'}`;
          }
          return 'Indicator detected';
        }).slice(0, 8);
      };
      
      const validatedSignal = validateSignal(parsed.signal);
      
      return {
        signal: {
          action: validatedSignal.action || 'HOLD',
          confidence: Math.min(Math.max(validatedSignal.confidence || 0, 0), 100),
          entryPoint: validatedSignal.entryPoint || 0,
          takeProfit: Array.isArray(validatedSignal.takeProfit) 
            ? validatedSignal.takeProfit.slice(0, 3) 
            : [validatedSignal.takeProfit || 0],
          stopLoss: validatedSignal.stopLoss || 0,
          riskReward: validatedSignal.riskReward || 1,
          timeframe: validatedSignal.timeframe || 'medium',
          validationReason: validatedSignal.reason || 'Signal validated',
          confluenceCount: this.countConfluenceFactors(parsed)
        },
        chartAnalysis: {
          detectedPatterns: sanitizePatterns(parsed.chartAnalysis?.detectedPatterns),
          technicalIndicators: Array.isArray(parsed.chartAnalysis?.technicalIndicators) 
            ? parsed.chartAnalysis.technicalIndicators.map(ind => ({
                name: ind.name || 'Unknown',
                value: ind.value || 0,
                signal: ind.signal || 'neutral'
              })) 
            : [],
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
          confidence: 0,
          entryPoint: 0,
          takeProfit: [0],
          stopLoss: 0,
          riskReward: 1,
          timeframe: 'medium',
          validationReason: 'Analysis parsing failed',
          confluenceCount: 0
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

  countConfluenceFactors(parsed) {
    let count = 0;
    
    // Mandatory factors
    if (parsed.chartAnalysis?.trend && parsed.chartAnalysis.trend !== 'sideways') count++; // HTF trend
    if (parsed.chartAnalysis?.supportLevels?.length > 0 || parsed.chartAnalysis?.resistanceLevels?.length > 0) count++; // Strong levels
    
    // Additional confluence factors
    if (parsed.chartAnalysis?.volume === 'high') count++;
    if (parsed.chartAnalysis?.detectedPatterns?.length >= 2) count++;
    if (parsed.chartAnalysis?.technicalIndicators?.length >= 3) count++;
    if (parsed.chartAnalysis?.timeframeAlignment === 'aligned') count++;
    if ((parsed.signal?.riskReward || 0) >= 4) count++; // Increased R:R requirement
    if (parsed.reasoning?.catalysts?.length >= 2) count++; // Fundamental support
    if (parsed.reasoning?.secondary?.length >= 3) count++; // Multiple confirmations
    
    return count;
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
        },
        index: index
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
          result = await model.generateContent([prompt, ...imageParts.map(p => ({ inlineData: p.inlineData }))]);
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
      
      // Lower timeframe entry refinement for multi-image analysis
      if (analysisData.signal.action !== 'HOLD') {
        try {
          console.log('Identifying lowest timeframe for entry refinement...');
          const lowestTimeframeIndex = await this.identifyLowestTimeframe(imageParts, modelName);
          const refinementImagePart = imageParts[lowestTimeframeIndex] || imageParts[imageParts.length - 1];
          
          console.log(`Using image ${lowestTimeframeIndex + 1} for entry refinement (lowest timeframe detected)`);
          const refinedEntry = await this.refineLowerTimeframeEntry(analysisData, { inlineData: refinementImagePart.inlineData }, modelName);
          if (refinedEntry) {
            analysisData.signal.entryPoint = refinedEntry.entryPoint;
            analysisData.signal.stopLoss = refinedEntry.stopLoss;
            analysisData.signal.takeProfit = refinedEntry.takeProfit;
            analysisData.entryRefinement = {
              refined: true,
              originalEntry: analysisData.signal.entryPoint,
              refinedEntry: refinedEntry.entryPoint,
              refinementReason: refinedEntry.reason,
              refinementImageIndex: lowestTimeframeIndex
            };
          }
        } catch (refinementError) {
          console.error('Multi-image entry refinement failed:', refinementError);
        }
      }
      
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

  async identifyLowestTimeframe(imageParts, modelName) {
    try {
      const identificationPrompt = `You are Huntr AI analyzing multiple chart images to identify timeframes.

Analyze these ${imageParts.length} chart images and identify which one shows the LOWEST/SHORTEST timeframe (1m, 5m, 15m, etc.).

Look for:
- More candles/bars in the visible time period
- Shorter time intervals between candles
- More detailed price action
- Higher frequency of price movements

Return ONLY the image number (1-${imageParts.length}) that shows the lowest timeframe:

{"lowestTimeframeImage": number}`;

      const result = await this.getModel(modelName).generateContent([identificationPrompt, ...imageParts.map(p => ({ inlineData: p.inlineData }))]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const imageNumber = parsed.lowestTimeframeImage;
        if (imageNumber >= 1 && imageNumber <= imageParts.length) {
          return imageNumber - 1; // Convert to 0-based index
        }
      }
      
      // Fallback to last image if identification fails
      return imageParts.length - 1;
    } catch (error) {
      console.error('Timeframe identification error:', error);
      return imageParts.length - 1; // Fallback to last image
    }
  }

  async refineLowerTimeframeEntry(analysis, imagePart, modelName) {
    try {
      const refinementPrompt = `You are Huntr AI performing LOWER TIMEFRAME ENTRY REFINEMENT.

Your HTF analysis determined: ${analysis.signal.action} signal with ${analysis.signal.confidence}% confidence.
Current entry: ${analysis.signal.entryPoint}
Current stop: ${analysis.signal.stopLoss}

Now analyze this LOWEST TIMEFRAME chart image for PRECISE ENTRY:

1. ENTRY REFINEMENT RULES:
   - For BUY: Look for pullback to demand zone, order block, or support
   - For SELL: Look for pullback to supply zone, order block, or resistance
   - Wait for liquidity sweep + structure break confirmation
   - Entry MUST be better than original HTF entry

2. STOP LOSS REFINEMENT:
   - Place stop beyond nearest swing point
   - Account for spread and slippage
   - Maintain minimum 1:4 risk/reward

3. TAKE PROFIT REFINEMENT:
   - Target nearest opposing liquidity levels
   - Scale out at key resistance/support levels
   - Maintain institutional R:R ratios

Return ONLY JSON:
{
  "entryPoint": refined_entry_price,
  "stopLoss": refined_stop_price,
  "takeProfit": [tp1, tp2, tp3],
  "reason": "brief explanation of refinement"
}

If no better entry found, return null.`;

      const result = await this.getModel(modelName).generateContent([refinementPrompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const refined = JSON.parse(jsonMatch[0]);
        
        // Validate refinement improves the setup
        if (analysis.signal.action === 'BUY' && refined.entryPoint < analysis.signal.entryPoint) {
          return refined;
        }
        if (analysis.signal.action === 'SELL' && refined.entryPoint > analysis.signal.entryPoint) {
          return refined;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Entry refinement error:', error);
      return null;
    }
  }

  async performAdvancedWebSearch(analysisData, userId = null) {
    try {
      const allSearchResults = [];
      const symbol = analysisData.marketContext?.symbol || 'market';
      const marketType = analysisData.marketContext?.marketType || 'crypto';
      const signal = analysisData.signal?.action || 'HOLD';
      
      // PHASE 1: Initial Market Context Search
      console.log('Advanced Search Phase 1: Market context and fundamentals...');
      const phase1Queries = [
        `${symbol} ${marketType} price analysis trend direction ${new Date().toISOString().split('T')[0]}`,
        `${symbol} fundamental analysis earnings news catalyst events`,
        `${symbol} institutional money flow smart money analysis whale activity`,
        `${symbol} technical analysis support resistance key levels`,
        `${marketType} market sentiment analysis today current trends`
      ];
      
      for (const query of phase1Queries) {
        try {
          const results = await this.searchService.searchMarketData(query);
          if (results.length > 0) {
            allSearchResults.push({
              phase: 1,
              query,
              results: results.slice(0, 3),
              timestamp: new Date(),
              relevanceScore: this.calculateSearchRelevance(results, analysisData)
            });
          }
          await new Promise(resolve => setTimeout(resolve, 600));
        } catch (queryError) {
          console.error(`Phase 1 search failed for: ${query}`, queryError);
        }
      }
      
      // PHASE 2: Signal-Specific Deep Dive
      if (signal !== 'HOLD') {
        console.log(`Advanced Search Phase 2: ${signal} signal validation...`);
        const phase2Queries = [
          `${symbol} ${signal.toLowerCase()} signal confirmation technical indicators`,
          `${symbol} ${marketType} ${signal.toLowerCase()} setup risk reward analysis`,
          `${symbol} market structure ${signal.toLowerCase()} entry exit strategy`,
          `${symbol} volume analysis ${signal.toLowerCase()} confirmation signals`,
          `${marketType} ${signal.toLowerCase()} signals accuracy institutional analysis`
        ];
        
        for (const query of phase2Queries) {
          try {
            const results = await this.searchService.searchMarketData(query);
            if (results.length > 0) {
              allSearchResults.push({
                phase: 2,
                query,
                results: results.slice(0, 2),
                timestamp: new Date(),
                relevanceScore: this.calculateSearchRelevance(results, analysisData)
              });
            }
            await new Promise(resolve => setTimeout(resolve, 700));
          } catch (queryError) {
            console.error(`Phase 2 search failed for: ${query}`, queryError);
          }
        }
      }
      
      // PHASE 3: Risk Assessment and Validation
      console.log('Advanced Search Phase 3: Risk assessment and market validation...');
      const phase3Queries = [
        `${symbol} ${marketType} risk factors bearish bullish catalysts`,
        `${symbol} correlation analysis market conditions volatility`,
        `${marketType} market manipulation whale movements ${symbol}`,
        `${symbol} regulatory news SEC compliance legal issues`,
        `${symbol} competitor analysis sector performance comparison`
      ];
      
      for (const query of phase3Queries) {
        try {
          const results = await this.searchService.searchMarketData(query);
          if (results.length > 0) {
            allSearchResults.push({
              phase: 3,
              query,
              results: results.slice(0, 2),
              timestamp: new Date(),
              relevanceScore: this.calculateSearchRelevance(results, analysisData)
            });
          }
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (queryError) {
          console.error(`Phase 3 search failed for: ${query}`, queryError);
        }
      }
      
      // PHASE 4: Adaptive Follow-up Search Based on Initial Results
      if (allSearchResults.length > 0) {
        console.log('Advanced Search Phase 4: Adaptive follow-up based on findings...');
        const followUpQueries = await this.generateAdaptiveQueries(allSearchResults, analysisData);
        
        for (const query of followUpQueries.slice(0, 3)) {
          try {
            const results = await this.searchService.searchMarketData(query);
            if (results.length > 0) {
              allSearchResults.push({
                phase: 4,
                query,
                results: results.slice(0, 2),
                timestamp: new Date(),
                relevanceScore: this.calculateSearchRelevance(results, analysisData),
                adaptive: true
              });
            }
            await new Promise(resolve => setTimeout(resolve, 900));
          } catch (queryError) {
            console.error(`Phase 4 adaptive search failed for: ${query}`, queryError);
          }
        }
      }
      
      // Sort by relevance and return comprehensive results
      const sortedResults = allSearchResults
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, 15); // Top 15 most relevant results
      
      console.log(`Advanced search completed: ${sortedResults.length} results across ${Math.max(...sortedResults.map(r => r.phase))} phases`);
      return sortedResults;
      
    } catch (error) {
      console.error('Advanced web search error:', error);
      return [];
    }
  }
  
  async generateAdaptiveQueries(searchResults, analysisData) {
    try {
      // Extract key themes and entities from search results
      const allContent = searchResults
        .flatMap(sr => sr.results)
        .map(r => `${r.title} ${r.snippet}`)
        .join(' ');
      
      const symbol = analysisData.marketContext?.symbol || 'market';
      const marketType = analysisData.marketContext?.marketType || 'crypto';
      
      // Generate adaptive queries based on discovered themes
      const adaptiveQueries = [];
      
      // Check for specific themes in search results
      if (allContent.toLowerCase().includes('earnings') || allContent.toLowerCase().includes('revenue')) {
        adaptiveQueries.push(`${symbol} earnings impact price prediction ${marketType}`);
      }
      
      if (allContent.toLowerCase().includes('partnership') || allContent.toLowerCase().includes('acquisition')) {
        adaptiveQueries.push(`${symbol} partnership acquisition impact analysis`);
      }
      
      if (allContent.toLowerCase().includes('regulation') || allContent.toLowerCase().includes('sec')) {
        adaptiveQueries.push(`${symbol} regulatory impact ${marketType} compliance analysis`);
      }
      
      if (allContent.toLowerCase().includes('whale') || allContent.toLowerCase().includes('institutional')) {
        adaptiveQueries.push(`${symbol} whale movements institutional buying selling pressure`);
      }
      
      if (allContent.toLowerCase().includes('technical') || allContent.toLowerCase().includes('resistance')) {
        adaptiveQueries.push(`${symbol} technical breakout resistance support confluence analysis`);
      }
      
      // Always add a general market sentiment query
      adaptiveQueries.push(`${symbol} ${marketType} market sentiment analysis current outlook`);
      
      return adaptiveQueries;
    } catch (error) {
      console.error('Adaptive query generation error:', error);
      return [];
    }
  }
  
  calculateSearchRelevance(results, analysis) {
    let score = 0;
    const signal = analysis.signal?.action?.toLowerCase() || '';
    const symbol = analysis.marketContext?.symbol?.toLowerCase() || '';
    const marketType = analysis.marketContext?.marketType?.toLowerCase() || '';
    
    results.forEach(result => {
      const content = `${result.title} ${result.snippet}`.toLowerCase();
      
      // Core relevance factors
      if (content.includes(symbol)) score += 25;
      if (content.includes(marketType)) score += 15;
      if (content.includes(signal)) score += 20;
      
      // High-value content indicators
      if (content.includes('institutional') || content.includes('smart money')) score += 30;
      if (content.includes('whale') || content.includes('large holder')) score += 25;
      if (content.includes('technical analysis') || content.includes('chart analysis')) score += 20;
      if (content.includes('fundamental') || content.includes('earnings')) score += 20;
      
      // Market structure and timing
      if (content.includes('support') || content.includes('resistance')) score += 15;
      if (content.includes('breakout') || content.includes('breakdown')) score += 18;
      if (content.includes('volume') || content.includes('liquidity')) score += 15;
      
      // Risk and sentiment factors
      if (content.includes('risk') || content.includes('volatility')) score += 12;
      if (content.includes('sentiment') || content.includes('outlook')) score += 10;
      if (content.includes('catalyst') || content.includes('event')) score += 15;
      
      // Recency bonus
      if (content.includes('today') || content.includes('latest') || content.includes('current')) score += 8;
      
      // Quality source indicators
      if (result.title.includes('Analysis') || result.title.includes('Report')) score += 5;
    });
    
    return score;
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