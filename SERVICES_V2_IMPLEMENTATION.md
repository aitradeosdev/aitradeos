# Services V2 Implementation

## Overview
Created complete duplicates of Gemini and Search services for Analysis V2 system.

## New Service Files

### 1. Search Service V2
**File:** `api/services/searchv2.js`
- All functionality preserved:
  - Market data search via Serper API
  - Query enhancement
  - Result parsing and relevance scoring
  - Trusted source filtering
  - Market sentiment analysis
  - Specific market queries (crypto, stocks, forex)

### 2. Gemini Service V2
**File:** `api/services/geminiv2.js`
- Updated to use `searchv2` service
- All functionality preserved:
  - Chart image analysis (single & multiple)
  - AI learning context
  - Web search integration
  - Analysis refinement with market data
  - Training data storage
  - Chat with analysis
  - Feedback learning
  - Image validation

## Service Dependencies

```
analysisv2.js (routes)
    ↓
geminiv2.js (AI service)
    ↓
searchv2.js (search service)
```

## Integration

### Analysis V2 Route
```javascript
// api/routes/analysisv2.js
const geminiService = require('../services/geminiv2');
```

### Gemini V2 Service
```javascript
// api/services/geminiv2.js
this.searchService = require('./searchv2');
```

## Features (Identical to V1)

### Search Service V2
- ✅ Serper.dev API integration
- ✅ Query enhancement with market keywords
- ✅ Trusted source filtering (Bloomberg, Reuters, etc.)
- ✅ Relevance scoring algorithm
- ✅ News and organic results parsing
- ✅ Market sentiment analysis
- ✅ Fallback results on timeout
- ✅ Market-specific queries (crypto/stocks/forex)

### Gemini Service V2
- ✅ Gemini 2.5 Flash/Pro model support
- ✅ Single & multi-image analysis
- ✅ Advanced Smart Money Concepts prompts
- ✅ AI learning from successful analyses
- ✅ Web search enhancement
- ✅ Analysis refinement with market data
- ✅ Training data storage
- ✅ Chat functionality
- ✅ Feedback learning system
- ✅ Image validation
- ✅ Model fallback on overload

## Service Methods

### SearchService V2
```javascript
searchMarketData(query)
enhanceQuery(query)
parseSearchResults(data)
isRelevantSource(item)
hasMarketRelevantContent(content)
calculateRelevance(item)
isRecent(dateString)
isTrustedFinancialSource(url)
extractDomain(url)
getFallbackResults(query)
searchSpecificMarket(symbol, marketType)
buildMarketSpecificQueries(symbol, marketType)
getMarketSentiment(symbol)
```

### GeminiService V2
```javascript
getModel(modelName)
analyzeChartImage(imageBuffer, mimeType, userId)
getLearningContext(userId)
storeAnalysisForLearning(analysisData, imageBuffer, userId)
buildAnalysisPrompt(learningContext)
parseGeminiResponse(responseText)
performWebSearch(queries)
refineAnalysisWithWebData(baseAnalysis, webResults, userId)
analyzeMultipleChartImages(images, userId)
storeMultiAnalysisForLearning(analysisData, images, userId)
buildMultiImageAnalysisPrompt(imageCount, learningContext)
chatWithAnalysis(analysisId, message, userId)
updateLearningFromFeedback(analysisId, feedback)
validateImageForAnalysis(imageBuffer, mimeType)
```

## Configuration

Both V2 services use the same environment variables:
```env
GEMINI_API_KEY=your-gemini-api-key
SERPER_API_KEY=your-serper-api-key
```

## Testing

### Test Search V2
```javascript
const searchv2 = require('./api/services/searchv2');
const results = await searchv2.searchMarketData('BTC price analysis');
console.log(results);
```

### Test Gemini V2
```javascript
const geminiv2 = require('./api/services/geminiv2');
const analysis = await geminiv2.analyzeChartImage(imageBuffer, 'image/jpeg', userId);
console.log(analysis);
```

## Benefits of Separate Services

1. **Independent Development**: Modify V2 without affecting V1
2. **A/B Testing**: Compare performance between versions
3. **Feature Testing**: Test new AI prompts or search algorithms
4. **Rollback Safety**: Keep V1 stable while experimenting with V2
5. **Performance Comparison**: Measure differences in response times
6. **Model Testing**: Try different Gemini models or parameters

## File Structure
```
api/
├── services/
│   ├── search.js          (V1)
│   ├── searchv2.js        (V2) ✨ NEW
│   ├── gemini.js          (V1)
│   └── geminiv2.js        (V2) ✨ NEW
└── routes/
    ├── analysis.js        (V1 - uses gemini.js)
    └── analysisv2.js      (V2 - uses geminiv2.js)
```

## Next Steps

You can now:
1. Modify V2 services independently
2. Test different AI prompts in geminiv2.js
3. Experiment with search algorithms in searchv2.js
4. Compare V1 vs V2 performance
5. Implement new features without risk to V1

## Notes
- Both versions share the same database models
- Both use the same API keys (Gemini & Serper)
- Both have identical error handling
- V2 services are completely independent from V1
- No changes required to existing V1 functionality
