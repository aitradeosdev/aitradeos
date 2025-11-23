const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.searchService = require('./searchv2');
    this.TrainingDataModel = require('../models/TrainingData');
    this.UserModel = require('../models/User');
  }

  getModel(modelName = 'gemini-2.5-flash') {
    return this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent analysis
        topP: 0.8,
        topK: 40,
      }
    });
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

      const learningContext = await this.getLearningContext(userId);
      const prompt = this.buildAnalysisPrompt(learningContext);

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

      let analysisData = this.parseGeminiResponse(text);
      
      // CRITICAL: Validate and fix risk management
      analysisData = this.validateAndFixRiskManagement(analysisData);
      
      await this.storeAnalysisForLearning(analysisData, imageBuffer, userId);
      
      // Enhanced web search with better integration
      if (analysisData.searchQueries && analysisData.searchQueries.length > 0) {
        try {
          console.log('Performing intelligent web search...');
          const webSearchResults = await this.performWebSearch(analysisData.searchQueries, analysisData);
          analysisData.webSearchResults = webSearchResults;
          analysisData.webSearchPerformed = true;
          
          if (webSearchResults.length > 0) {
            const refinedAnalysis = await this.refineAnalysisWithWebData(analysisData, webSearchResults, userId);
            
            // Only update if refinement improves quality
            if (this.isRefinementBetter(analysisData, refinedAnalysis)) {
              analysisData.signal = refinedAnalysis.signal;
              analysisData.reasoning = refinedAnalysis.reasoning;
              analysisData.reasoning.webSearchEnhanced = true;
            }
          }
        } catch (searchError) {
          console.error('Web search failed:', searchError);
          analysisData.webSearchPerformed = false;
        }
      }

      // Final quality check
      if (!this.passesQualityCheck(analysisData)) {
        console.log('Analysis failed quality check, applying safety adjustments');
        analysisData = this.applySafetyAdjustments(analysisData);
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

  validateAndFixRiskManagement(analysisData) {
    const signal = analysisData.signal;
    
    // Fix stop loss equal to take profit issue
    if (Math.abs(signal.stopLoss - signal.entryPoint) <= Math.abs((signal.takeProfit[0] || signal.entryPoint) - signal.entryPoint) * 0.25) {
      console.log('FIXING: Stop loss too close to entry or equal to TP');
      
      const direction = signal.action === 'BUY' ? 1 : -1;
      const avgTP = signal.takeProfit.reduce((a, b) => a + b, 0) / signal.takeProfit.length;
      const tpDistance = Math.abs(avgTP - signal.entryPoint);
      
      // Stop loss should be at least 35% of TP distance for reasonable RR
      const minSLDistance = tpDistance * 0.35;
      signal.stopLoss = signal.entryPoint - (direction * minSLDistance);
      
      // Recalculate risk/reward
      const slDistance = Math.abs(signal.stopLoss - signal.entryPoint);
      const calculatedRR = tpDistance / slDistance;
      signal.riskReward = isNaN(calculatedRR) || !isFinite(calculatedRR) ? 1.5 : parseFloat(calculatedRR.toFixed(2));
      
      // More lenient: only HOLD if RR is extremely bad
      if (signal.riskReward < 1.2) {
        console.log('Risk/reward critically low after adjustment, setting to HOLD');
        signal.action = 'HOLD';
        signal.confidence = Math.min(signal.confidence, 40);
        analysisData.reasoning.risks.unshift('Risk/reward ratio too low - setup not recommended');
      } else if (signal.riskReward < 1.5) {
        // Lower confidence but allow trade
        signal.confidence = Math.min(signal.confidence, 70);
        if (!analysisData.reasoning.risks.some(r => r.includes('risk/reward'))) {
          analysisData.reasoning.risks.push('Lower risk/reward ratio - consider smaller position size');
        }
      }
    }
    
    // Validate take profit levels
    if (signal.action !== 'HOLD') {
      const direction = signal.action === 'BUY' ? 1 : -1;
      
      signal.takeProfit = signal.takeProfit.filter((tp, idx) => {
        const isValidDirection = direction > 0 ? tp > signal.entryPoint : tp < signal.entryPoint;
        if (!isValidDirection) {
          console.log(`Removing invalid TP${idx + 1}: ${tp}`);
        }
        return isValidDirection;
      });
      
      // Ensure at least one valid TP
      if (signal.takeProfit.length === 0) {
        const tpDistance = Math.abs(signal.stopLoss - signal.entryPoint) * 2;
        signal.takeProfit = [signal.entryPoint + (direction * tpDistance)];
        console.log('Generated new TP based on SL distance');
      }
      
      // Sort TPs by distance from entry
      signal.takeProfit.sort((a, b) => 
        direction > 0 ? a - b : b - a
      );
    }
    
    // Validate stop loss direction
    if (signal.action === 'BUY' && signal.stopLoss >= signal.entryPoint) {
      console.log('FIXING: Buy signal with SL above entry');
      const avgTP = signal.takeProfit.reduce((a, b) => a + b, 0) / signal.takeProfit.length;
      const tpDistance = avgTP - signal.entryPoint;
      signal.stopLoss = signal.entryPoint - (tpDistance * 0.4);
    } else if (signal.action === 'SELL' && signal.stopLoss <= signal.entryPoint) {
      console.log('FIXING: Sell signal with SL below entry');
      const avgTP = signal.takeProfit.reduce((a, b) => a + b, 0) / signal.takeProfit.length;
      const tpDistance = signal.entryPoint - avgTP;
      signal.stopLoss = signal.entryPoint + (tpDistance * 0.4);
    }
    
    // Cap confidence based on risk/reward - more lenient
    if (signal.riskReward < 1.3 && signal.confidence > 65) {
      signal.confidence = 65;
      console.log('Confidence capped due to lower risk/reward');
    } else if (signal.riskReward < 1.5 && signal.confidence > 75) {
      signal.confidence = 75;
      console.log('Confidence slightly reduced due to moderate risk/reward');
    }
    
    return analysisData;
  }

  passesQualityCheck(analysisData) {
    const signal = analysisData.signal;
    
    // Check 1: Valid action
    if (!['BUY', 'SELL', 'HOLD'].includes(signal.action)) {
      console.log('Quality check failed: Invalid action');
      return false;
    }
    
    // Check 2: Reasonable confidence - more lenient
    if (signal.action !== 'HOLD' && signal.confidence < 50) {
      console.log('Quality check failed: Confidence too low for trade signal');
      return false;
    }
    
    // Check 3: Valid risk/reward - lowered threshold
    if (signal.action !== 'HOLD' && signal.riskReward < 1.2) {
      console.log('Quality check failed: Risk/reward too low');
      return false;
    }
    
    // Check 4: Valid price levels
    if (signal.entryPoint <= 0 || signal.stopLoss <= 0) {
      console.log('Quality check failed: Invalid price levels');
      return false;
    }
    
    // Check 5: TPs in correct direction
    if (signal.action !== 'HOLD') {
      const direction = signal.action === 'BUY' ? 1 : -1;
      const validTPs = signal.takeProfit.every(tp => 
        direction > 0 ? tp > signal.entryPoint : tp < signal.entryPoint
      );
      if (!validTPs) {
        console.log('Quality check failed: TPs in wrong direction');
        return false;
      }
    }
    
    // Check 6: Sufficient reasoning
    if (!analysisData.reasoning.primary || analysisData.reasoning.primary.length < 20) {
      console.log('Quality check failed: Insufficient reasoning');
      return false;
    }
    
    return true;
  }

  applySafetyAdjustments(analysisData) {
    console.log('Applying safety adjustments to failed analysis');
    
    analysisData.signal.action = 'HOLD';
    analysisData.signal.confidence = Math.min(analysisData.signal.confidence, 45);
    
    if (!analysisData.reasoning.risks.some(r => r.includes('quality'))) {
      analysisData.reasoning.risks.unshift('Analysis quality checks failed - more confirmation needed');
    }
    
    analysisData.reasoning.primary = 'Insufficient clear signals for high-confidence trade setup. ' + 
                                     (analysisData.reasoning.primary || 'Market analysis incomplete.');
    
    return analysisData;
  }

  isRefinementBetter(original, refined) {
    // Don't accept refinement that significantly reduces confidence without good reason
    if (refined.signal.confidence < original.signal.confidence - 20) {
      return false;
    }
    
    // Don't accept refinement that worsens risk/reward significantly
    if (refined.signal.riskReward < original.signal.riskReward * 0.7) {
      return false;
    }
    
    // Accept if confidence improved or stayed similar
    return refined.signal.confidence >= original.signal.confidence - 10;
  }

  async getLearningContext(userId = null) {
    try {
      const recentAnalyses = await this.TrainingDataModel.model
        .find({
          'feedback.userRating': { $gte: 4 },
          'performance.actualOutcome': 'success',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
        .sort({ 'feedback.userRating': -1, createdAt: -1 })
        .limit(15)
        .select('chartAnalysis aiAnalysis feedback performance');

      let userAnalyses = [];
      if (userId) {
        const user = await this.UserModel.model.findById(userId)
          .select('analysisHistory')
          .populate('analysisHistory');
        
        if (user) {
          userAnalyses = user.analysisHistory
            .filter(a => a.feedback?.rating >= 4 && a.performance?.actualOutcome === 'success')
            .slice(-10);
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
      learningSection = `\n📚 LEARNED FROM ${learningContext.totalLearningPoints} SUCCESSFUL TRADES:\n`;
      
      if (learningContext.recentSuccessfulAnalyses.length > 0) {
        const topPatterns = {};
        learningContext.recentSuccessfulAnalyses.forEach(analysis => {
          if (analysis.aiAnalysis?.signal && analysis.performance?.actualOutcome === 'success') {
            const key = `${analysis.aiAnalysis.signal.action}_RR${Math.floor(analysis.aiAnalysis.signal.riskReward)}`;
            topPatterns[key] = (topPatterns[key] || 0) + 1;
          }
        });
        
        const bestPatterns = Object.entries(topPatterns)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        learningSection += '✅ Most successful setups:\n';
        bestPatterns.forEach(([pattern, count]) => {
          learningSection += `   • ${pattern} setup (${count} successful trades)\n`;
        });
      }
    }

    return `You are an expert trading analyst. Analyze this chart with EXTREME PRECISION.

${learningSection}
🎯 ANALYSIS FRAMEWORK:

1. MARKET STRUCTURE (Primary Focus):
   • Identify current trend on visible timeframe
   • Locate key swing highs and lows (last 3-5 clear pivots)
   • Mark break of structure (BOS) if present
   • Identify trading range: discount zone (<50%) vs premium zone (>50%)

2. LIQUIDITY ANALYSIS:
   • Equal highs/lows = liquidity pools
   • Stop loss clusters above/below obvious levels
   • Liquidity sweep = price spike through level then reversal
   • Entry MUST be positioned relative to liquidity (below for buys, above for sells)

3. ORDER BLOCKS & FAIR VALUE GAPS:
   • Order Block = Last opposite-color candle before strong move
   • FVG = Gap between candle wicks (imbalance area)
   • Breaker Block = Order block that failed, now acts as opposite
   • Price must show reaction at these levels

4. CONFLUENCE REQUIREMENTS (Need 3+ to trade):
   ✓ Clear trend or range direction
   ✓ At key support/resistance level
   ✓ Liquidity sweep occurred
   ✓ Order block or FVG present
   ✓ Price in discount (buy) or premium (sell)
   ✓ Candlestick pattern confirmation
   ✓ Volume increasing

5. RISK MANAGEMENT (STRICT BUT FAIR):
   • Stop Loss MUST be beyond structure (swing high/low)
   • Risk/Reward MINIMUM 1.3:1, ideal 2:1+
   • TP1 at nearest liquidity/resistance
   • TP2 at next major level
   • TP3 at swing high/low (runners)
   • NEVER place SL closer than 30% of TP distance

⚠️ REJECTION CRITERIA (Signal HOLD if ANY present):
   ❌ Risk/Reward < 1.2
   ❌ No clear structure or direction
   ❌ Less than 2 confluence factors
   ❌ Stop loss would be hit by normal market noise
   ❌ Extremely choppy/ranging with zero direction
   ❌ Confidence < 55% for BUY/SELL signals

📊 REQUIRED JSON RESPONSE:
{
  "signal": {
    "action": "BUY|SELL|HOLD",
    "confidence": 0-100,
    "entryPoint": <exact price>,
    "takeProfit": [<TP1>, <TP2>, <TP3>],
    "stopLoss": <price beyond structure>,
    "riskReward": <calculated ratio>,
    "timeframe": "short|medium|long"
  },
  "chartAnalysis": {
    "detectedPatterns": ["pattern1", "pattern2"],
    "technicalIndicators": ["indicator: signal"],
    "supportLevels": [<prices>],
    "resistanceLevels": [<prices>],
    "volume": "high|medium|low",
    "trend": "uptrend|downtrend|sideways",
    "structureBreak": "bullish|bearish|none",
    "liquidityLevel": "above|below|neutral",
    "orderBlockPresent": true|false
  },
  "reasoning": {
    "primary": "<main reason - be specific about structure and levels>",
    "secondary": ["<specific confluence factor 1>", "<specific confluence factor 2>"],
    "risks": ["<specific risk 1>", "<specific risk 2>"],
    "catalysts": ["<positive factor 1>", "<positive factor 2>"]
  },
  "marketContext": {
    "symbol": "<if visible>",
    "timeframe": "<if visible>",
    "marketType": "crypto|forex|stocks|commodities"
  },
  "searchQueries": ["<symbol> price analysis", "<symbol> market sentiment"]
}

🔍 ANALYSIS RULES:
1. BE CONSERVATIVE - When in doubt, signal HOLD
2. REQUIRE CLEAR STRUCTURE - No ambiguous setups
3. VALIDATE RISK/REWARD - Calculate precisely, minimum 1.3:1
4. CHECK CONFLUENCE - Need at least 2 strong factors
5. POSITION STOPS CORRECTLY - Beyond structure, not arbitrary
6. BE SPECIFIC - Reference exact price levels and patterns you see
7. If giving BUY/SELL, confidence MUST be 55+
8. If confidence < 55 OR no clear setup, signal HOLD
9. Accept moderate RR (1.3-1.8) if setup has strong confluence

Now analyze this chart with precision:`;
  }

  parseGeminiResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Strict validation
      const action = (parsed.signal?.action || 'HOLD').toUpperCase();
      if (!['BUY', 'SELL', 'HOLD'].includes(action)) {
        console.log('Invalid action detected, defaulting to HOLD');
        parsed.signal.action = 'HOLD';
      }
      
      // Extract patterns as simple strings
      const extractPatterns = (patterns) => {
        if (!Array.isArray(patterns)) return [];
        return patterns.map(p => {
          if (typeof p === 'string') return p;
          if (p?.type) return p.type;
          return 'Unknown pattern';
        }).slice(0, 5);
      };
      
      const extractIndicators = (indicators) => {
        if (!Array.isArray(indicators)) return [];
        return indicators.map(i => {
          if (typeof i === 'string') return i;
          if (i?.name) return `${i.name}: ${i.signal || 'neutral'}`;
          return 'Unknown indicator';
        }).slice(0, 5);
      };
      
      // Ensure numeric values are valid
      const safeNumber = (val, defaultVal = 0) => {
        const num = parseFloat(val);
        return isNaN(num) || !isFinite(num) || num === null || num === undefined ? defaultVal : num;
      };
      
      const safeTPs = Array.isArray(parsed.signal?.takeProfit) 
        ? parsed.signal.takeProfit.map(tp => safeNumber(tp)).filter(tp => tp > 0).slice(0, 3)
        : [safeNumber(parsed.signal?.takeProfit)].filter(tp => tp > 0);
      
      if (safeTPs.length === 0) safeTPs.push(safeNumber(parsed.signal?.entryPoint) * 1.02);
      
      return {
        signal: {
          action: action,
          confidence: Math.min(Math.max(safeNumber(parsed.signal?.confidence, 50), 0), 100),
          entryPoint: safeNumber(parsed.signal?.entryPoint),
          takeProfit: safeTPs,
          stopLoss: safeNumber(parsed.signal?.stopLoss),
          riskReward: safeNumber(parsed.signal?.riskReward, 1),
          timeframe: parsed.signal?.timeframe || 'medium'
        },
        chartAnalysis: {
          detectedPatterns: extractPatterns(parsed.chartAnalysis?.detectedPatterns),
          technicalIndicators: extractIndicators(parsed.chartAnalysis?.technicalIndicators),
          supportLevels: Array.isArray(parsed.chartAnalysis?.supportLevels) 
            ? parsed.chartAnalysis.supportLevels.map(l => safeNumber(l)).filter(l => l > 0) 
            : [],
          resistanceLevels: Array.isArray(parsed.chartAnalysis?.resistanceLevels) 
            ? parsed.chartAnalysis.resistanceLevels.map(l => safeNumber(l)).filter(l => l > 0)
            : [],
          volume: parsed.chartAnalysis?.volume || 'medium',
          trend: parsed.chartAnalysis?.trend || 'sideways',
          timeframeAlignment: parsed.chartAnalysis?.timeframeAlignment || 'mixed',
          structureBreak: parsed.chartAnalysis?.structureBreak || 'none',
          liquidityLevel: parsed.chartAnalysis?.liquidityLevel || 'neutral',
          orderBlockPresent: parsed.chartAnalysis?.orderBlockPresent || false
        },
        reasoning: {
          primary: parsed.reasoning?.primary || 'Technical analysis based on chart patterns',
          secondary: Array.isArray(parsed.reasoning?.secondary) 
            ? parsed.reasoning.secondary.filter(s => s && s.length > 5).slice(0, 5)
            : [],
          risks: Array.isArray(parsed.reasoning?.risks) 
            ? parsed.reasoning.risks.filter(r => r && r.length > 5).slice(0, 5)
            : ['Market volatility', 'Unexpected news events'],
          catalysts: Array.isArray(parsed.reasoning?.catalysts) 
            ? parsed.reasoning.catalysts.filter(c => c && c.length > 5).slice(0, 5)
            : []
        },
        marketContext: {
          symbol: parsed.marketContext?.symbol || 'Unknown',
          timeframe: parsed.marketContext?.timeframe || 'Unknown',
          timeframes: Array.isArray(parsed.marketContext?.timeframes) 
            ? parsed.marketContext.timeframes 
            : [],
          marketType: parsed.marketContext?.marketType || 'unknown'
        },
        searchQueries: Array.isArray(parsed.searchQueries) 
          ? parsed.searchQueries.filter(q => q && q.length > 3).slice(0, 3)
          : []
      };

    } catch (error) {
      console.error('JSON parsing failed:', error);
      
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
          timeframeAlignment: 'mixed',
          structureBreak: 'none',
          liquidityLevel: 'neutral',
          orderBlockPresent: false
        },
        reasoning: {
          primary: 'Analysis parsing failed - manual review required',
          secondary: ['AI response could not be processed correctly'],
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

  async performWebSearch(queries, analysisData) {
    try {
      const searchResults = [];
      
      const prioritizedQueries = queries
        .map(q => ({
          query: q,
          priority: analysisData.signal.confidence < 70 ? 'high' : 'normal'
        }))
        .slice(0, 3);
      
      for (const { query, priority } of prioritizedQueries) {
        try {
          const options = {
            timeRange: 'day',
            trustedSourcesOnly: priority === 'high',
            numResults: 20
          };
          
          const results = await this.searchService.searchMarketData(query, options);
          
          searchResults.push({
            query,
            results: results.results.slice(0, 5),
            insights: results.insights,
            priority,
            metadata: results.metadata,
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
      const relevantInsights = this.extractRelevantInsights(webResults, baseAnalysis);

      const refinementPrompt = `You are refining a trading analysis with current market data.

ORIGINAL TECHNICAL ANALYSIS:
Action: ${baseAnalysis.signal.action}
Confidence: ${baseAnalysis.signal.confidence}%
Entry: ${baseAnalysis.signal.entryPoint}
Risk/Reward: ${baseAnalysis.signal.riskReward}
Primary Reason: ${baseAnalysis.reasoning.primary}

CURRENT MARKET DATA:
${relevantInsights}

REFINEMENT RULES:
1. Only INCREASE confidence if market data strongly supports the technical setup
2. DECREASE confidence if market data contradicts the setup
3. Consider changing to HOLD if major contradictions exist
4. Update reasoning to include market context
5. DO NOT change entry, TP, or SL levels - only adjust confidence and reasoning
6. Risk/reward must stay >= 1.8

Return ONLY this JSON:
{
  "signal": {
    "action": "BUY|SELL|HOLD",
    "confidence": 0-100,
    "entryPoint": ${baseAnalysis.signal.entryPoint},
    "takeProfit": ${JSON.stringify(baseAnalysis.signal.takeProfit)},
    "stopLoss": ${baseAnalysis.signal.stopLoss},
    "riskReward": ${baseAnalysis.signal.riskReward},
    "timeframe": "${baseAnalysis.signal.timeframe}"
  },
  "reasoning": {
    "primary": "<updated primary reason with market context>",
    "secondary": ["<updated factors>"],
    "risks": ["<updated risks>"],
    "catalysts": ["<updated catalysts>"]
  }
}`;

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
        
        // Validate refinement doesn't break risk management
        if (refined.signal && refined.signal.riskReward >= 1.5) {
          return {
            signal: refined.signal,
            reasoning: refined.reasoning || baseAnalysis.reasoning
          };
        }
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

  extractRelevantInsights(webResults, baseAnalysis) {
    let insights = '';
    
    webResults.forEach(result => {
      if (result.insights) {
        // Price movements
        if (result.insights.priceMovements && result.insights.priceMovements.length > 0) {
          insights += '\nRecent Price Movements:\n';
          result.insights.priceMovements.forEach(pm => {
            insights += `- ${pm.direction} ${pm.percentage}% (${pm.source})\n`;
          });
        }
        
        // Sentiment
        if (result.insights.sentiment) {
          insights += `\nMarket Sentiment: ${result.insights.sentiment.overall} (${result.insights.sentiment.confidence}% confidence)\n`;
        }
        
        // Major news
        if (result.insights.majorNews && result.insights.majorNews.length > 0) {
          insights += '\nMajor News:\n';
          result.insights.majorNews.forEach(news => {
            insights += `- ${news.title} (${news.source})\n`;
          });
        }
      }
    });
    
    return insights || 'No significant market data found';
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

      const learningContext = await this.getLearningContext(userId);
      const prompt = this.buildMultiImageAnalysisPrompt(images.length, learningContext);

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
              const delay = Math.pow(2, attempts) * 1000;
              console.log(`Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              
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

      let analysisData = this.parseGeminiResponse(text);
      
      // Validate multi-timeframe analysis
      analysisData = this.validateAndFixRiskManagement(analysisData);
      
      await this.storeMultiAnalysisForLearning(analysisData, images, userId);
      
      if (analysisData.searchQueries && analysisData.searchQueries.length > 0) {
        try {
          const webSearchResults = await this.performWebSearch(analysisData.searchQueries, analysisData);
          analysisData.webSearchResults = webSearchResults;
          
          if (webSearchResults.length > 0) {
            const refinedAnalysis = await this.refineAnalysisWithWebData(analysisData, webSearchResults, userId);
            
            if (this.isRefinementBetter(analysisData, refinedAnalysis)) {
              analysisData.signal = refinedAnalysis.signal;
              analysisData.reasoning = refinedAnalysis.reasoning;
            }
          }
        } catch (searchError) {
          console.error('Web search failed:', searchError);
        }
      }

      // Final quality check
      if (!this.passesQualityCheck(analysisData)) {
        analysisData = this.applySafetyAdjustments(analysisData);
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
      learningSection = `\n📚 MULTI-TIMEFRAME SUCCESS PATTERNS (${learningContext.totalLearningPoints} trades):\n`;
      
      if (learningContext.recentSuccessfulAnalyses.length > 0) {
        const mtfSuccesses = learningContext.recentSuccessfulAnalyses
          .filter(a => a.multiImageAnalysis && a.performance?.actualOutcome === 'success')
          .slice(0, 5);
        
        if (mtfSuccesses.length > 0) {
          learningSection += '✅ Successful multi-timeframe setups:\n';
          mtfSuccesses.forEach((a, i) => {
            if (a.aiAnalysis?.signal) {
              learningSection += `   ${i+1}. ${a.aiAnalysis.signal.action} with ${a.aiAnalysis.signal.confidence}% confidence (RR: ${a.aiAnalysis.signal.riskReward})\n`;
            }
          });
        }
      }
    }

    return `You are analyzing ${imageCount} charts showing different timeframes of the same asset.

${learningSection}
🎯 MULTI-TIMEFRAME ANALYSIS FRAMEWORK:

STEP 1 - HIGHER TIMEFRAME (HTF) BIAS:
• Identify overall trend direction
• Mark major support/resistance zones
• Locate key liquidity levels (swing highs/lows)
• Determine if in discount (<50%) or premium (>50%) zone
• Find major order blocks and institutional levels

STEP 2 - INTERMEDIATE TIMEFRAME CONFIRMATION:
• Confirm HTF bias is holding
• Identify current structure (trending or ranging)
• Check for break of structure (BOS) in HTF direction
• Look for change of character (ChoCh) signals
• Mark swing points for entry reference

STEP 3 - LOWER TIMEFRAME (LTF) ENTRY:
• Wait for liquidity sweep in LTF
• Find order block or FVG in HTF direction
• Entry positioned correctly (below liquidity for buys, above for sells)
• Confirm with candlestick pattern
• Volume must support the move

⚙️ TIMEFRAME ALIGNMENT RULES:
✓ HTF trend = trade direction
✓ Intermediate TF confirms structure
✓ LTF provides precise entry
✗ NEVER trade against HTF trend
✗ NEVER enter in middle of HTF range
✗ NEVER trade without 3+ timeframe confluence

🎯 RISK MANAGEMENT (CRITICAL):
• Stop loss MUST be beyond HTF structure
• For BUY: SL below HTF support/swing low
• For SELL: SL above HTF resistance/swing high
• TP1 at LTF resistance/support
• TP2 at intermediate TF level
• TP3 at HTF target
• Minimum Risk/Reward: 1.5:1
• If RR < 1.5, reduce confidence or signal HOLD

⚠️ MULTI-TF REJECTION CRITERIA:
❌ HTF and intermediate TF contradicting
❌ No clear HTF bias
❌ Price in middle of HTF range with no direction
❌ LTF choppy despite HTF trend
❌ Risk/Reward < 1.3:1
❌ Stop loss not beyond clear structure
❌ Less than 2 confluence factors across timeframes

📊 REQUIRED JSON RESPONSE:
{
  "signal": {
    "action": "BUY|SELL|HOLD",
    "confidence": 0-100,
    "entryPoint": <LTF entry price>,
    "takeProfit": [<LTF target>, <MTF target>, <HTF target>],
    "stopLoss": <beyond HTF structure>,
    "riskReward": <minimum 2.0>,
    "timeframe": "short|medium|long"
  },
  "chartAnalysis": {
    "detectedPatterns": ["HTF: pattern", "MTF: pattern", "LTF: pattern"],
    "technicalIndicators": ["TF: indicator signal"],
    "supportLevels": [<HTF level>, <MTF level>, <LTF level>],
    "resistanceLevels": [<HTF level>, <MTF level>, <LTF level>],
    "volume": "high|medium|low",
    "trend": "uptrend|downtrend|sideways",
    "timeframeAlignment": "aligned|mixed|conflicting",
    "htfBias": "bullish|bearish|neutral",
    "mtfStructure": "trending|ranging",
    "ltfEntry": "confirmed|pending|rejected"
  },
  "reasoning": {
    "primary": "<main reason referencing all timeframes>",
    "secondary": ["<HTF confluence>", "<MTF confirmation>", "<LTF entry signal>"],
    "risks": ["<specific multi-TF risk>"],
    "catalysts": ["<positive factors across TFs>"]
  },
  "marketContext": {
    "symbol": "<if visible>",
    "timeframes": ["<HTF>", "<MTF>", "<LTF>"],
    "marketType": "crypto|forex|stocks|commodities"
  },
  "searchQueries": ["<symbol> multi-timeframe analysis", "<symbol> price forecast"]
}

🔍 MULTI-TF RULES:
1. HTF TREND IS KING - Never trade against it
2. TIMEFRAMES SHOULD ALIGN - If strongly conflicting, signal HOLD
3. ENTRY ON LTF - Precision matters
4. STOPS BEYOND HTF STRUCTURE - Not arbitrary levels
5. MINIMUM RR 1.3:1 - Lower = reduce confidence significantly
6. CONFIDENCE 60+ for BUY/SELL - Otherwise HOLD or lower confidence
7. BE SPECIFIC - Reference which chart shows what
8. Accept moderate RR if multi-TF confluence is strong

Analyze all ${imageCount} charts with strict multi-timeframe discipline:`;
  }

  async chatWithAnalysis(analysisId, message, userId) {
    try {
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

      const chatPrompt = `You are Huntr AI, discussing a chart analysis you performed.

YOUR ANALYSIS:
Signal: ${analysisContext.signal.action} at ${analysisContext.signal.entryPoint}
Confidence: ${analysisContext.signal.confidence}%
Risk/Reward: ${analysisContext.signal.riskReward}:1
Stop Loss: ${analysisContext.signal.stopLoss}
Take Profits: ${analysisContext.signal.takeProfit.join(', ')}

Reasoning: ${analysisContext.reasoning.primary}
Key Factors: ${analysisContext.reasoning.secondary.join(', ')}

Analysis Date: ${analysisContext.timestamp}

User Question: ${message}

Respond professionally, referencing your analysis. Be helpful but maintain trading education focus:`;

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

      console.log(`AI learning updated: Rating ${feedback.rating}/5, Outcome: ${feedback.actualOutcome}`);
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