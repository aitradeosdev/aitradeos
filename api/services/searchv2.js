const axios = require('axios');
const logger = require('../utils/logger');

class EnhancedSearchService {
  constructor() {
    this.serperApiKey = process.env.SERPER_API_KEY;
    this.baseUrl = 'https://google.serper.dev';
    
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    
    this.lastRequestTime = 0;
    this.minRequestInterval = 200;
    
    this.qualityWeights = {
      sourceAuthority: 0.35,
      recency: 0.30,
      relevance: 0.25,
      contentDepth: 0.10
    };
  }

  async searchMarketData(query, options = {}) {
    try {
      if (!this.serperApiKey) {
        throw new Error('Serper API key not configured');
      }

      const cacheKey = this.getCacheKey(query, options);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.info(`Cache hit for query: ${query}`);
        return cached;
      }

      await this.enforceRateLimit();

      const enhancedQuery = this.buildIntelligentQuery(query, options);
      const searchType = this.determineSearchType(query);
      const searchParams = this.buildSearchParameters(enhancedQuery, searchType, options);

      logger.info(`Searching: ${enhancedQuery} (type: ${searchType})`);

      const response = await this.executeSearch(searchParams);
      
      const parsedResults = this.parseSearchResults(response.data, query);
      const insights = this.extractAdvancedInsights(parsedResults, query);
      
      const result = {
        results: parsedResults,
        insights,
        metadata: {
          query: enhancedQuery,
          originalQuery: query,
          searchType,
          timestamp: new Date(),
          resultCount: parsedResults.length,
          searchParameters: searchParams
        }
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;

    } catch (error) {
      logger.error('Enhanced search error:', error);
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return this.getFallbackResults(query);
      }
      
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  buildIntelligentQuery(query, options = {}) {
    let enhancedQuery = query.trim();
    
    const intent = this.detectSearchIntent(query);
    
    // Add time context for price/news
    if (intent.isPriceQuery || intent.isNewsQuery) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      enhancedQuery = `${enhancedQuery} ${dateStr}`;
    }
    
    // Add trading context if missing
    if (!intent.hasMarketContext) {
      enhancedQuery = `${enhancedQuery} trading analysis`;
    }
    
    // Focus on quality sources
    if (options.trustedSourcesOnly) {
      const topSources = [
        'tradingview.com', 'investing.com', 'bloomberg.com',
        'coindesk.com', 'cointelegraph.com', 'marketwatch.com'
      ];
      enhancedQuery = `${enhancedQuery} (${topSources.map(s => `site:${s}`).join(' OR ')})`;
    }
    
    return enhancedQuery;
  }

  detectSearchIntent(query) {
    const lowerQuery = query.toLowerCase();
    
    return {
      isPriceQuery: /price|cost|value|\$|usd|btc|eth/i.test(lowerQuery),
      isNewsQuery: /news|update|latest|breaking/i.test(lowerQuery),
      isTechnicalQuery: /technical|chart|pattern|support|resistance/i.test(lowerQuery),
      isSentimentQuery: /sentiment|bull|bear/i.test(lowerQuery),
      hasMarketContext: /trading|market|crypto|stock|forex|analysis/i.test(lowerQuery),
      isComparison: /vs|versus|compare/i.test(lowerQuery)
    };
  }

  determineSearchType(query) {
    const intent = this.detectSearchIntent(query);
    return intent.isNewsQuery ? 'news' : 'search';
  }

  buildSearchParameters(query, searchType, options = {}) {
    const params = {
      q: query,
      num: options.numResults || 20,
      gl: options.country || 'us',
      hl: options.language || 'en',
      autocorrect: options.autocorrect !== false
    };

    if (options.timeRange) {
      params.tbs = this.buildTimeBasedSearch(options.timeRange);
    } else if (searchType === 'news') {
      params.tbs = 'qdr:d'; // Past day for news
    }

    if (searchType === 'news') {
      params.type = 'news';
    }

    return params;
  }

  buildTimeBasedSearch(timeRange) {
    const timeRangeMap = {
      'hour': 'qdr:h',
      'day': 'qdr:d',
      'week': 'qdr:w',
      'month': 'qdr:m',
      'year': 'qdr:y'
    };
    
    return timeRangeMap[timeRange] || 'qdr:d';
  }

  async executeSearch(params) {
    const endpoint = params.type === 'news' ? `${this.baseUrl}/news` : `${this.baseUrl}/search`;
    
    return await axios.post(endpoint, params, {
      headers: {
        'X-API-KEY': this.serperApiKey,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
  }

  parseSearchResults(data, originalQuery) {
    const results = [];
    const processedUrls = new Set();

    // Prioritize news results
    if (data.news) {
      data.news.forEach(item => {
        if (!processedUrls.has(item.link)) {
          const result = this.enrichResult(item, originalQuery, 'news');
          result.qualityScore += 20; // Boost news
          results.push(result);
          processedUrls.add(item.link);
        }
      });
    }

    // Process organic results
    if (data.organic) {
      data.organic.forEach(item => {
        if (!processedUrls.has(item.link) && this.isHighQualityResult(item, originalQuery)) {
          const result = this.enrichResult(item, originalQuery);
          results.push(result);
          processedUrls.add(item.link);
        }
      });
    }

    // Add knowledge graph
    if (data.knowledgeGraph) {
      results.push({
        type: 'knowledge_graph',
        title: data.knowledgeGraph.title,
        description: data.knowledgeGraph.description,
        attributes: data.knowledgeGraph.attributes,
        qualityScore: 100,
        source: 'Google Knowledge Graph'
      });
    }

    return results
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 15);
  }

  isHighQualityResult(item, query) {
    const isTrustedSource = this.isTrustedFinancialSource(item.link);
    const hasRelevantContent = this.hasMarketRelevantContent(
      `${item.title} ${item.snippet}`,
      query
    );
    const isSpam = this.detectSpamIndicators(item);
    
    return (isTrustedSource || hasRelevantContent) && !isSpam;
  }

  enrichResult(item, query, type = 'organic') {
    const content = `${item.title} ${item.snippet}`;
    
    return {
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: this.extractDomain(item.link),
      type,
      qualityScore: this.calculateAdvancedQualityScore(item, query),
      sentiment: this.detectSentiment(content),
      relevance: this.calculateRelevanceScore(content, query),
      recencyScore: this.calculateRecencyScore(item.date),
      extractedData: this.extractStructuredData(content),
      timestamp: new Date(item.date || Date.now())
    };
  }

  calculateAdvancedQualityScore(item, query) {
    let score = 0;
    const content = `${item.title} ${item.snippet}`.toLowerCase();

    const authorityScore = this.calculateAuthorityScore(item.link);
    score += authorityScore * this.qualityWeights.sourceAuthority;

    const recencyScore = this.calculateRecencyScore(item.date);
    score += recencyScore * this.qualityWeights.recency;

    const relevanceScore = this.calculateRelevanceScore(content, query);
    score += relevanceScore * this.qualityWeights.relevance;

    const depthScore = this.calculateContentDepth(content);
    score += depthScore * this.qualityWeights.contentDepth;

    return Math.round(score);
  }

  calculateAuthorityScore(url) {
    const domain = this.extractDomain(url);
    
    // Tier 1: Premium sources
    const tier1 = ['bloomberg.com', 'reuters.com', 'wsj.com', 'ft.com'];
    if (tier1.some(s => domain.includes(s))) return 100;
    
    // Tier 2: Major trading platforms
    const tier2 = ['tradingview.com', 'investing.com', 'marketwatch.com'];
    if (tier2.some(s => domain.includes(s))) return 90;
    
    // Tier 3: Crypto specialized
    const tier3 = ['coindesk.com', 'cointelegraph.com', 'coingecko.com', 'coinmarketcap.com'];
    if (tier3.some(s => domain.includes(s))) return 80;
    
    // Tier 4: General financial
    const tier4 = ['cnbc.com', 'forbes.com', 'businessinsider.com', 'yahoo.com'];
    if (tier4.some(s => domain.includes(s))) return 65;
    
    return 40;
  }

  calculateRecencyScore(dateString) {
    if (!dateString) return 40;
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const hoursDiff = (now - date) / (1000 * 60 * 60);
      
      if (hoursDiff <= 1) return 100;
      if (hoursDiff <= 6) return 95;
      if (hoursDiff <= 24) return 85;
      if (hoursDiff <= 72) return 65;
      if (hoursDiff <= 168) return 45;
      
      return 20;
    } catch {
      return 40;
    }
  }

  calculateRelevanceScore(content, query) {
    const contentLower = content.toLowerCase();
    const queryTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
    
    let score = 0;
    let termMatches = 0;
    
    // Exact match bonus
    if (contentLower.includes(query.toLowerCase())) {
      score += 40;
    }
    
    // Term matches
    queryTerms.forEach(term => {
      if (contentLower.includes(term)) {
        termMatches++;
        score += 8;
      }
    });
    
    // Term density
    const termDensity = termMatches / Math.max(queryTerms.length, 1);
    score += termDensity * 35;
    
    return Math.min(score, 100);
  }

  calculateContentDepth(content) {
    const wordCount = content.split(' ').length;
    
    if (wordCount > 200) return 100;
    if (wordCount > 100) return 80;
    if (wordCount > 50) return 60;
    if (wordCount > 20) return 40;
    
    return 20;
  }

  extractAdvancedInsights(results, query) {
    return {
      priceMovements: this.extractPriceMovements(results),
      sentiment: this.analyzeSentiment(results),
      technicalLevels: this.extractTechnicalLevels(results),
      majorNews: this.extractMajorNews(results),
      marketConsensus: this.determineMarketConsensus(results),
      sourceDistribution: this.analyzeSourceDistribution(results),
      timelinessScore: this.calculateTimelinessScore(results),
      reliabilityScore: this.calculateReliabilityScore(results)
    };
  }

  extractPriceMovements(results) {
    const movements = [];
    
    results.forEach(result => {
      const content = `${result.title} ${result.snippet}`.toLowerCase();
      
      const percentagePattern = /(\d+\.?\d*)%\s*(up|down|gain|loss|increase|decrease|higher|lower|rise|fall)/gi;
      let match;
      
      while ((match = percentagePattern.exec(content)) !== null) {
        const direction = ['up', 'gain', 'increase', 'higher', 'rise'].includes(match[2].toLowerCase()) 
          ? 'bullish' 
          : 'bearish';
        
        movements.push({
          percentage: parseFloat(match[1]),
          direction,
          source: result.source,
          confidence: result.qualityScore
        });
      }
    });
    
    return movements.slice(0, 5);
  }

  analyzeSentiment(results) {
    let bullishScore = 0;
    let bearishScore = 0;
    let neutralScore = 0;
    
    results.forEach(result => {
      const sentiment = result.sentiment;
      const weight = result.qualityScore / 100;
      
      if (sentiment === 'bullish') bullishScore += weight;
      else if (sentiment === 'bearish') bearishScore += weight;
      else neutralScore += weight;
    });
    
    const total = bullishScore + bearishScore + neutralScore;
    
    if (total === 0) {
      return { overall: 'neutral', confidence: 0, distribution: {} };
    }
    
    const maxScore = Math.max(bullishScore, bearishScore, neutralScore);
    let overall = 'neutral';
    if (maxScore === bullishScore) overall = 'bullish';
    else if (maxScore === bearishScore) overall = 'bearish';
    
    return {
      overall,
      confidence: Math.round((maxScore / total) * 100),
      distribution: {
        bullish: Math.round((bullishScore / total) * 100),
        bearish: Math.round((bearishScore / total) * 100),
        neutral: Math.round((neutralScore / total) * 100)
      },
      raw: {
        bullishScore: bullishScore.toFixed(2),
        bearishScore: bearishScore.toFixed(2),
        neutralScore: neutralScore.toFixed(2)
      }
    };
  }

  extractTechnicalLevels(results) {
    const levels = [];
    
    results.forEach(result => {
      const content = `${result.title} ${result.snippet}`.toLowerCase();
      
      const levelPattern = /(support|resistance)\s*(?:at|near|level)?\s*\$?(\d+,?\d*\.?\d*)/gi;
      let match;
      
      while ((match = levelPattern.exec(content)) !== null) {
        const priceStr = match[2].replace(/,/g, '');
        levels.push({
          type: match[1],
          price: parseFloat(priceStr),
          source: result.source,
          confidence: result.qualityScore
        });
      }
    });
    
    return levels.slice(0, 5);
  }

  extractMajorNews(results) {
    return results
      .filter(r => r.type === 'news' || r.recencyScore > 80)
      .slice(0, 3)
      .map(r => ({
        title: r.title,
        source: r.source,
        timestamp: r.timestamp,
        sentiment: r.sentiment,
        link: r.link
      }));
  }

  determineMarketConsensus(results) {
    const sentimentAnalysis = this.analyzeSentiment(results);
    const priceMovements = this.extractPriceMovements(results);
    
    let consensusScore = 0;
    
    if (sentimentAnalysis.confidence > 60) {
      consensusScore += 50;
    }
    
    if (priceMovements.length > 2) {
      const bullishMoves = priceMovements.filter(m => m.direction === 'bullish').length;
      const bearishMoves = priceMovements.filter(m => m.direction === 'bearish').length;
      
      if (Math.max(bullishMoves, bearishMoves) / priceMovements.length > 0.65) {
        consensusScore += 50;
      }
    }
    
    return {
      hasConsensus: consensusScore > 60,
      consensusStrength: consensusScore,
      direction: sentimentAnalysis.overall
    };
  }

  analyzeSourceDistribution(results) {
    const sources = {};
    
    results.forEach(result => {
      const tier = this.getSourceTier(result.source);
      sources[tier] = (sources[tier] || 0) + 1;
    });
    
    return sources;
  }

  getSourceTier(domain) {
    if (['bloomberg.com', 'reuters.com', 'wsj.com', 'ft.com'].some(s => domain.includes(s))) {
      return 'premium';
    }
    if (['tradingview.com', 'investing.com', 'marketwatch.com'].some(s => domain.includes(s))) {
      return 'major';
    }
    if (['coindesk.com', 'cointelegraph.com'].some(s => domain.includes(s))) {
      return 'crypto';
    }
    return 'general';
  }

  calculateTimelinessScore(results) {
    if (results.length === 0) return 0;
    const avgRecency = results.reduce((sum, r) => sum + (r.recencyScore || 0), 0) / results.length;
    return Math.round(avgRecency);
  }

  calculateReliabilityScore(results) {
    if (results.length === 0) return 0;
    const avgQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    return Math.round(avgQuality);
  }

  detectSentiment(content) {
    const contentLower = content.toLowerCase();
    
    const bullishKeywords = ['bullish', 'bull', 'positive', 'optimistic', 'gain', 'rise', 'rally', 'surge', 'breakout', 'uptrend'];
    const bearishKeywords = ['bearish', 'bear', 'negative', 'pessimistic', 'loss', 'fall', 'crash', 'decline', 'breakdown', 'downtrend'];
    
    let bullishCount = 0;
    let bearishCount = 0;
    
    bullishKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = contentLower.match(regex);
      if (matches) bullishCount += matches.length;
    });
    
    bearishKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = contentLower.match(regex);
      if (matches) bearishCount += matches.length;
    });
    
    if (bullishCount > bearishCount * 1.3) return 'bullish';
    if (bearishCount > bullishCount * 1.3) return 'bearish';
    return 'neutral';
  }

  extractStructuredData(content) {
    const data = {};
    
    const priceMatch = content.match(/\$?(\d+,?\d*\.?\d*)/);
    if (priceMatch) {
      data.price = priceMatch[1].replace(',', '');
    }
    
    const percentMatch = content.match(/(\d+\.?\d*)%/);
    if (percentMatch) {
      data.percentage = parseFloat(percentMatch[1]);
    }
    
    return data;
  }

  hasMarketRelevantContent(content, query) {
    const relevantKeywords = [
      'price', 'trading', 'market', 'analysis', 'bull', 'bear', 'trend',
      'support', 'resistance', 'volume', 'breakout', 'technical', 'chart',
      'signal', 'momentum', 'rsi', 'macd', 'moving average',
      'candlestick', 'pattern', 'crypto', 'bitcoin', 'ethereum', 'stock',
      'forex', 'buy', 'sell', 'target', 'stop loss'
    ];
    
    const contentLower = content.toLowerCase();
    const matchCount = relevantKeywords.filter(keyword => 
      contentLower.includes(keyword)
    ).length;
    
    return matchCount >= 2;
  }

  isTrustedFinancialSource(url) {
    const trustedSources = [
      'bloomberg.com', 'reuters.com', 'wsj.com', 'ft.com',
      'tradingview.com', 'investing.com', 'marketwatch.com',
      'coindesk.com', 'cointelegraph.com', 'cnbc.com',
      'yahoo.com', 'nasdaq.com', 'forbes.com', 'benzinga.com',
      'coingecko.com', 'coinmarketcap.com'
    ];
    
    return trustedSources.some(source => url.includes(source));
  }

  detectSpamIndicators(item) {
    const spamKeywords = ['click here', 'limited time', 'act now', 'guaranteed profit', 'get rich'];
    const content = `${item.title} ${item.snippet}`.toLowerCase();
    
    return spamKeywords.some(keyword => content.includes(keyword));
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  getCacheKey(query, options) {
    return `${query}-${JSON.stringify(options)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  getFallbackResults(query) {
    return {
      results: [{
        title: 'Search temporarily unavailable',
        snippet: `Market analysis for: ${query}. Please check financial news sources for latest updates.`,
        source: 'fallback',
        qualityScore: 0,
        type: 'fallback',
        timestamp: new Date()
      }],
      insights: {
        priceMovements: [],
        sentiment: { overall: 'neutral', confidence: 0, distribution: {} },
        majorNews: [],
        marketConsensus: { hasConsensus: false, consensusStrength: 0 }
      },
      metadata: {
        query,
        searchType: 'fallback',
        timestamp: new Date()
      }
    };
  }

  async searchSpecificMarket(symbol, marketType = 'crypto', options = {}) {
    const queries = this.buildMarketSpecificQueries(symbol, marketType);
    const results = [];

    for (const query of queries) {
      try {
        const searchResults = await this.searchMarketData(query, {
          ...options,
          timeRange: 'day',
          trustedSourcesOnly: true
        });
        
        results.push({
          query,
          ...searchResults
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error(`Failed to search for: ${query}`, error);
      }
    }

    return this.aggregateMarketSearchResults(results, symbol);
  }

  buildMarketSpecificQueries(symbol, marketType) {
    const baseQueries = [
      `${symbol} price analysis today`,
      `${symbol} technical analysis`,
      `${symbol} market news`
    ];

    if (marketType === 'crypto') {
      baseQueries.push(`${symbol} cryptocurrency trend`);
    } else if (marketType === 'stocks') {
      baseQueries.push(`${symbol} stock forecast`);
    } else if (marketType === 'forex') {
      baseQueries.push(`${symbol} forex signals`);
    }

    return baseQueries.slice(0, 3);
  }

  aggregateMarketSearchResults(results, symbol) {
    const aggregated = {
      symbol,
      timestamp: new Date(),
      allResults: results.flatMap(r => r.results || []),
      combinedInsights: {
        priceMovements: [],
        sentiment: { overall: 'neutral', confidence: 0 },
        technicalLevels: [],
        majorNews: []
      }
    };

    results.forEach(result => {
      if (result.insights) {
        aggregated.combinedInsights.priceMovements.push(...(result.insights.priceMovements || []));
        aggregated.combinedInsights.technicalLevels.push(...(result.insights.technicalLevels || []));
        aggregated.combinedInsights.majorNews.push(...(result.insights.majorNews || []));
      }
    });

    const allResults = aggregated.allResults;
    if (allResults.length > 0) {
      aggregated.combinedInsights.sentiment = this.analyzeSentiment(allResults);
    }

    return aggregated;
  }
}

module.exports = new EnhancedSearchService();