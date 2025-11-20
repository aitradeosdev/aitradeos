const axios = require('axios');
const logger = require('../utils/logger');

class EnhancedSearchService {
  constructor() {
    this.serperApiKey = process.env.SERPER_API_KEY;
    this.baseUrl = 'https://google.serper.dev';
    
    // Search result cache with TTL
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    
    // Rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 200; // ms between requests
    
    // Quality scoring weights
    this.qualityWeights = {
      sourceAuthority: 0.30,
      recency: 0.25,
      relevance: 0.25,
      sentiment: 0.10,
      contentDepth: 0.10
    };
  }

  // ==================== MAIN SEARCH METHOD ====================
  async searchMarketData(query, options = {}) {
    try {
      if (!this.serperApiKey) {
        throw new Error('Serper API key not configured');
      }

      // Check cache first
      const cacheKey = this.getCacheKey(query, options);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.info(`Cache hit for query: ${query}`);
        return cached;
      }

      // Rate limiting
      await this.enforceRateLimit();

      // Enhanced query building
      const enhancedQuery = this.buildIntelligentQuery(query, options);
      
      // Determine optimal search type
      const searchType = this.determineSearchType(query);
      
      // Build search parameters
      const searchParams = this.buildSearchParameters(enhancedQuery, searchType, options);

      logger.info(`Searching: ${enhancedQuery} (type: ${searchType})`);

      // Execute search
      const response = await this.executeSearch(searchParams);
      
      // Parse and rank results
      const parsedResults = this.parseSearchResults(response.data, query);
      
      // Extract insights
      const insights = this.extractAdvancedInsights(parsedResults, query);
      
      // Build comprehensive result
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

      // Cache the result
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

  // ==================== INTELLIGENT QUERY BUILDING ====================
  buildIntelligentQuery(query, options = {}) {
    let enhancedQuery = query.trim();
    
    // Detect intent and context
    const intent = this.detectSearchIntent(query);
    
    // Add time-based qualifiers for price/news queries
    if (intent.isPriceQuery || intent.isNewsQuery) {
      const today = new Date().toISOString().split('T')[0];
      enhancedQuery = `${enhancedQuery} ${today}`;
    }
    
    // Add market context if not present
    if (!intent.hasMarketContext) {
      enhancedQuery = `${enhancedQuery} trading market analysis`;
    }
    
    // Add specific operators for technical analysis
    if (intent.isTechnicalQuery) {
      enhancedQuery = `${enhancedQuery} technical analysis chart patterns`;
    }
    
    // Add site restrictions for high-quality sources
    if (options.trustedSourcesOnly) {
      const topSources = [
        'bloomberg.com', 'reuters.com', 'tradingview.com',
        'investing.com', 'coindesk.com', 'cointelegraph.com'
      ];
      enhancedQuery = `${enhancedQuery} (${topSources.map(s => `site:${s}`).join(' OR ')})`;
    }
    
    return enhancedQuery;
  }

  detectSearchIntent(query) {
    const lowerQuery = query.toLowerCase();
    
    return {
      isPriceQuery: /price|cost|value|worth|\$|usd|bitcoin|btc|eth/i.test(lowerQuery),
      isNewsQuery: /news|update|latest|today|breaking|announcement/i.test(lowerQuery),
      isTechnicalQuery: /technical|chart|pattern|indicator|support|resistance|rsi|macd/i.test(lowerQuery),
      isSentimentQuery: /sentiment|bull|bear|optimistic|pessimistic/i.test(lowerQuery),
      hasMarketContext: /trading|market|crypto|stock|forex|analysis/i.test(lowerQuery),
      isComparison: /vs|versus|compare|better than/i.test(lowerQuery)
    };
  }

  // ==================== SEARCH TYPE OPTIMIZATION ====================
  determineSearchType(query) {
    const intent = this.detectSearchIntent(query);
    
    // News search for current events
    if (intent.isNewsQuery) {
      return 'news';
    }
    
    // Regular search for most queries
    return 'search';
  }

  // ==================== ADVANCED SEARCH PARAMETERS ====================
  buildSearchParameters(query, searchType, options = {}) {
    const params = {
      q: query,
      num: options.numResults || 20, // Request more for better filtering
      gl: options.country || 'us',
      hl: options.language || 'en',
      autocorrect: options.autocorrect !== false
    };

    // Add time-based filtering
    if (options.timeRange) {
      params.tbs = this.buildTimeBasedSearch(options.timeRange);
    } else if (searchType === 'news') {
      params.tbs = 'qdr:w'; // Past week for news
    }

    // Add type-specific parameters
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
    
    return timeRangeMap[timeRange] || 'qdr:w';
  }

  // ==================== SEARCH EXECUTION ====================
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

  // ==================== ADVANCED RESULT PARSING ====================
  parseSearchResults(data, originalQuery) {
    const results = [];
    const processedUrls = new Set(); // Prevent duplicates

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

    // Process news results (higher priority)
    if (data.news) {
      data.news.forEach(item => {
        if (!processedUrls.has(item.link)) {
          const result = this.enrichResult(item, originalQuery, 'news');
          result.qualityScore += 15; // Boost news results
          results.push(result);
          processedUrls.add(item.link);
        }
      });
    }

    // Process knowledge graph
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

    // Sort by quality score
    return results
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 10);
  }

  // ==================== RESULT QUALITY ASSESSMENT ====================
  isHighQualityResult(item, query) {
    // Check for trusted sources
    const isTrustedSource = this.isTrustedFinancialSource(item.link);
    
    // Check content relevance
    const hasRelevantContent = this.hasMarketRelevantContent(
      `${item.title} ${item.snippet}`,
      query
    );
    
    // Check for spam indicators
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

  // ==================== ADVANCED QUALITY SCORING ====================
  calculateAdvancedQualityScore(item, query) {
    let score = 0;
    const content = `${item.title} ${item.snippet}`.toLowerCase();
    const queryTerms = query.toLowerCase().split(' ');

    // Source authority (30%)
    const authorityScore = this.calculateAuthorityScore(item.link);
    score += authorityScore * this.qualityWeights.sourceAuthority;

    // Recency (25%)
    const recencyScore = this.calculateRecencyScore(item.date);
    score += recencyScore * this.qualityWeights.recency;

    // Relevance (25%)
    const relevanceScore = this.calculateRelevanceScore(content, query);
    score += relevanceScore * this.qualityWeights.relevance;

    // Sentiment alignment (10%)
    const sentimentScore = this.calculateSentimentScore(content);
    score += sentimentScore * this.qualityWeights.sentiment;

    // Content depth (10%)
    const depthScore = this.calculateContentDepth(content);
    score += depthScore * this.qualityWeights.contentDepth;

    return Math.round(score);
  }

  calculateAuthorityScore(url) {
    const domain = this.extractDomain(url);
    
    // Tier 1: Premium financial sources
    const tier1 = ['bloomberg.com', 'reuters.com', 'wsj.com', 'ft.com'];
    if (tier1.some(s => domain.includes(s))) return 100;
    
    // Tier 2: Major financial sites
    const tier2 = ['tradingview.com', 'investing.com', 'marketwatch.com', 'cnbc.com'];
    if (tier2.some(s => domain.includes(s))) return 85;
    
    // Tier 3: Crypto-specific sites
    const tier3 = ['coindesk.com', 'cointelegraph.com', 'coingecko.com', 'coinmarketcap.com'];
    if (tier3.some(s => domain.includes(s))) return 75;
    
    // Tier 4: General news
    const tier4 = ['forbes.com', 'businessinsider.com', 'yahoo.com'];
    if (tier4.some(s => domain.includes(s))) return 60;
    
    return 40; // Unknown sources
  }

  calculateRecencyScore(dateString) {
    if (!dateString) return 30; // Default for no date
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const hoursDiff = (now - date) / (1000 * 60 * 60);
      
      if (hoursDiff <= 1) return 100;
      if (hoursDiff <= 6) return 95;
      if (hoursDiff <= 24) return 85;
      if (hoursDiff <= 72) return 70;
      if (hoursDiff <= 168) return 50; // 1 week
      if (hoursDiff <= 720) return 30; // 1 month
      
      return 10;
    } catch {
      return 30;
    }
  }

  calculateRelevanceScore(content, query) {
    const contentLower = content.toLowerCase();
    const queryTerms = query.toLowerCase().split(' ').filter(t => t.length > 2);
    
    let score = 0;
    let termMatches = 0;
    
    // Exact query match
    if (contentLower.includes(query.toLowerCase())) {
      score += 30;
    }
    
    // Individual term matches
    queryTerms.forEach(term => {
      if (contentLower.includes(term)) {
        termMatches++;
        score += 10;
      }
    });
    
    // Term density bonus
    const termDensity = termMatches / Math.max(queryTerms.length, 1);
    score += termDensity * 40;
    
    return Math.min(score, 100);
  }

  calculateSentimentScore(content) {
    const bullishKeywords = ['bull', 'bullish', 'rise', 'gain', 'positive', 'optimistic', 'surge', 'rally'];
    const bearishKeywords = ['bear', 'bearish', 'fall', 'loss', 'negative', 'pessimistic', 'crash', 'decline'];
    
    let sentiment = 0;
    
    bullishKeywords.forEach(keyword => {
      if (content.includes(keyword)) sentiment += 10;
    });
    
    bearishKeywords.forEach(keyword => {
      if (content.includes(keyword)) sentiment += 10;
    });
    
    return Math.min(sentiment, 100);
  }

  calculateContentDepth(content) {
    // Longer, more detailed content scores higher
    const wordCount = content.split(' ').length;
    
    if (wordCount > 200) return 100;
    if (wordCount > 100) return 80;
    if (wordCount > 50) return 60;
    if (wordCount > 20) return 40;
    
    return 20;
  }

  // ==================== ADVANCED INSIGHTS EXTRACTION ====================
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
      
      // Pattern: "X% up/down/gain/loss"
      const percentagePattern = /(\d+\.?\d*)%\s*(up|down|gain|loss|increase|decrease|higher|lower)/gi;
      let match;
      
      while ((match = percentagePattern.exec(content)) !== null) {
        movements.push({
          percentage: parseFloat(match[1]),
          direction: ['up', 'gain', 'increase', 'higher'].includes(match[2].toLowerCase()) ? 'bullish' : 'bearish',
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
    
    return {
      overall: bullishScore > bearishScore ? 'bullish' : bearishScore > bullishScore ? 'bearish' : 'neutral',
      confidence: Math.round((Math.max(bullishScore, bearishScore, neutralScore) / total) * 100),
      distribution: {
        bullish: Math.round((bullishScore / total) * 100),
        bearish: Math.round((bearishScore / total) * 100),
        neutral: Math.round((neutralScore / total) * 100)
      }
    };
  }

  extractTechnicalLevels(results) {
    const levels = [];
    
    results.forEach(result => {
      const content = `${result.title} ${result.snippet}`.toLowerCase();
      
      // Pattern: "support/resistance at/near $X" or "level at X"
      const levelPattern = /(support|resistance)\s*(?:at|near|level)?\s*\$?(\d+\.?\d*)/gi;
      let match;
      
      while ((match = levelPattern.exec(content)) !== null) {
        levels.push({
          type: match[1],
          price: parseFloat(match[2]),
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
    
    // Sentiment consensus
    if (sentimentAnalysis.confidence > 60) {
      consensusScore += 50;
    }
    
    // Price movement consensus
    if (priceMovements.length > 2) {
      const bullishMoves = priceMovements.filter(m => m.direction === 'bullish').length;
      const bearishMoves = priceMovements.filter(m => m.direction === 'bearish').length;
      
      if (Math.max(bullishMoves, bearishMoves) / priceMovements.length > 0.7) {
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
    const avgRecency = results.reduce((sum, r) => sum + (r.recencyScore || 0), 0) / results.length;
    return Math.round(avgRecency);
  }

  calculateReliabilityScore(results) {
    const avgQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    return Math.round(avgQuality);
  }

  // ==================== HELPER METHODS ====================
  detectSentiment(content) {
    const contentLower = content.toLowerCase();
    
    const bullishKeywords = ['bullish', 'bull', 'positive', 'optimistic', 'gain', 'rise', 'rally', 'surge', 'breakout'];
    const bearishKeywords = ['bearish', 'bear', 'negative', 'pessimistic', 'loss', 'fall', 'crash', 'decline', 'breakdown'];
    
    let bullishCount = 0;
    let bearishCount = 0;
    
    bullishKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) bullishCount++;
    });
    
    bearishKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) bearishCount++;
    });
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  }

  extractStructuredData(content) {
    const data = {};
    
    // Extract prices
    const priceMatch = content.match(/\$?(\d+,?\d*\.?\d*)/);
    if (priceMatch) {
      data.price = priceMatch[1].replace(',', '');
    }
    
    // Extract percentages
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
      'signal', 'momentum', 'rsi', 'macd', 'moving average', 'fibonacci',
      'candlestick', 'pattern', 'crypto', 'bitcoin', 'ethereum', 'stock',
      'forex', 'buy', 'sell', 'hold', 'target', 'stop loss', 'trade'
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
      'yahoo.com', 'nasdaq.com', 'forbes.com', 'benzinga.com'
    ];
    
    return trustedSources.some(source => url.includes(source));
  }

  detectSpamIndicators(item) {
    const spamKeywords = ['click here', 'limited time', 'act now', 'guaranteed'];
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

  // ==================== CACHING & RATE LIMITING ====================
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

  // ==================== FALLBACK ====================
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
        sentiment: { overall: 'neutral', confidence: 0 },
        majorNews: []
      },
      metadata: {
        query,
        searchType: 'fallback',
        timestamp: new Date()
      }
    };
  }

  // ==================== SPECIALIZED SEARCH METHODS ====================
  async searchSpecificMarket(symbol, marketType = 'crypto', options = {}) {
    const queries = this.buildMarketSpecificQueries(symbol, marketType);
    const results = [];

    for (const query of queries) {
      try {
        const searchResults = await this.searchMarketData(query, {
          ...options,
          timeRange: 'day', // Focus on recent data
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
    // Combine insights from multiple searches
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

    // Aggregate insights
    results.forEach(result => {
      if (result.insights) {
        aggregated.combinedInsights.priceMovements.push(...(result.insights.priceMovements || []));
        aggregated.combinedInsights.technicalLevels.push(...(result.insights.technicalLevels || []));
        aggregated.combinedInsights.majorNews.push(...(result.insights.majorNews || []));
      }
    });

    // Calculate combined sentiment
    const allResults = aggregated.allResults;
    if (allResults.length > 0) {
      aggregated.combinedInsights.sentiment = this.analyzeSentiment(allResults);
    }

    return aggregated;
  }
}

module.exports = new EnhancedSearchService();
