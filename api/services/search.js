const axios = require('axios');
const logger = require('../utils/logger');

class SearchService {
  constructor() {
    this.serperApiKey = process.env.SERPER_API_KEY;
    this.baseUrl = 'https://google.serper.dev/search';
  }

  async searchMarketData(query) {
    try {
      if (!this.serperApiKey) {
        throw new Error('Serper API key not configured');
      }

      const enhancedQuery = this.enhanceQuery(query);

      const response = await axios.post(this.baseUrl, {
        q: enhancedQuery,
        num: 10,
        country: 'us',
        language: 'en'
      }, {
        headers: {
          'X-API-KEY': this.serperApiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return this.parseSearchResults(response.data);

    } catch (error) {
      logger.error('Serper search error:', error);
      
      if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
        return this.getFallbackResults(query);
      }
      
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  enhanceQuery(query) {
    const marketKeywords = [
      'trading', 'price', 'analysis', 'market', 'crypto', 'stock', 
      'forex', 'technical', 'chart', 'signal'
    ];

    const hasMarketKeyword = marketKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );

    if (!hasMarketKeyword) {
      return `${query} trading market analysis`;
    }

    const timeBasedQuery = `${query} ${new Date().toISOString().split('T')[0]}`;
    return timeBasedQuery;
  }

  parseSearchResults(data) {
    const results = [];

    if (data.organic) {
      data.organic.forEach(item => {
        if (this.isRelevantSource(item)) {
          results.push({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            source: this.extractDomain(item.link),
            relevanceScore: this.calculateRelevance(item),
            timestamp: new Date()
          });
        }
      });
    }

    if (data.news) {
      data.news.forEach(item => {
        results.push({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          source: item.source || this.extractDomain(item.link),
          relevanceScore: this.calculateRelevance(item) + 10,
          timestamp: new Date(item.date || Date.now()),
          type: 'news'
        });
      });
    }

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);
  }

  isRelevantSource(item) {
    const trustedSources = [
      'coindesk.com', 'cointelegraph.com', 'reuters.com', 'bloomberg.com',
      'yahoo.com', 'marketwatch.com', 'tradingview.com', 'investing.com',
      'coinmarketcap.com', 'coingecko.com', 'benzinga.com', 'seekingalpha.com',
      'finviz.com', 'nasdaq.com', 'wsj.com', 'ft.com', 'cnbc.com',
      'forbes.com', 'businessinsider.com', 'decrypt.co'
    ];

    const domain = this.extractDomain(item.link);
    const isTrustedSource = trustedSources.some(source => domain.includes(source));

    const hasMarketKeywords = this.hasMarketRelevantContent(
      `${item.title} ${item.snippet}`
    );

    return isTrustedSource || hasMarketKeywords;
  }

  hasMarketRelevantContent(content) {
    const relevantKeywords = [
      'price', 'trading', 'market', 'analysis', 'bull', 'bear', 'trend',
      'support', 'resistance', 'volume', 'breakout', 'technical', 'chart',
      'signal', 'momentum', 'rsi', 'macd', 'moving average', 'fibonacci',
      'candlestick', 'pattern', 'crypto', 'bitcoin', 'ethereum', 'stock',
      'forex', 'buy', 'sell', 'hold', 'target', 'stop loss'
    ];

    const contentLower = content.toLowerCase();
    return relevantKeywords.some(keyword => contentLower.includes(keyword));
  }

  calculateRelevance(item) {
    let score = 0;
    const content = `${item.title} ${item.snippet}`.toLowerCase();

    const highValueKeywords = ['price', 'analysis', 'signal', 'trading'];
    const mediumValueKeywords = ['market', 'trend', 'technical', 'chart'];
    const lowValueKeywords = ['news', 'update', 'report'];

    highValueKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 15;
    });

    mediumValueKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 10;
    });

    lowValueKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 5;
    });

    if (this.isRecent(item.date)) score += 20;
    if (this.isTrustedFinancialSource(item.link)) score += 25;

    return score;
  }

  isRecent(dateString) {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    } catch {
      return false;
    }
  }

  isTrustedFinancialSource(url) {
    const topTierSources = [
      'bloomberg.com', 'reuters.com', 'wsj.com', 'ft.com',
      'tradingview.com', 'investing.com', 'marketwatch.com'
    ];

    return topTierSources.some(source => url.includes(source));
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  getFallbackResults(query) {
    return [{
      title: 'Search temporarily unavailable',
      snippet: `Market analysis for: ${query}. Please check financial news sources for latest updates.`,
      source: 'fallback',
      relevanceScore: 0,
      timestamp: new Date(),
      type: 'fallback'
    }];
  }

  async searchSpecificMarket(symbol, marketType = 'crypto') {
    const queries = this.buildMarketSpecificQueries(symbol, marketType);
    const results = [];

    for (const query of queries) {
      try {
        const searchResults = await this.searchMarketData(query);
        results.push({
          query,
          results: searchResults.slice(0, 3)
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error(`Failed to search for: ${query}`, error);
      }
    }

    return results;
  }

  buildMarketSpecificQueries(symbol, marketType) {
    const baseQueries = [
      `${symbol} price analysis today`,
      `${symbol} technical analysis signals`,
      `${symbol} market sentiment news`
    ];

    if (marketType === 'crypto') {
      baseQueries.push(
        `${symbol} cryptocurrency market trend`,
        `${symbol} crypto trading signals`
      );
    } else if (marketType === 'stocks') {
      baseQueries.push(
        `${symbol} stock price target`,
        `${symbol} earnings analysis`
      );
    } else if (marketType === 'forex') {
      baseQueries.push(
        `${symbol} forex analysis today`,
        `${symbol} currency pair signals`
      );
    }

    return baseQueries.slice(0, 3);
  }

  async getMarketSentiment(symbol) {
    try {
      const sentimentQuery = `${symbol} market sentiment bull bear analysis`;
      const results = await this.searchMarketData(sentimentQuery);

      const sentimentKeywords = {
        bullish: ['bullish', 'bull', 'positive', 'optimistic', 'rise', 'up', 'gain'],
        bearish: ['bearish', 'bear', 'negative', 'pessimistic', 'fall', 'down', 'loss'],
        neutral: ['neutral', 'sideways', 'consolidation', 'range', 'uncertain']
      };

      let sentimentScore = 0;
      let totalMentions = 0;

      results.forEach(result => {
        const content = `${result.title} ${result.snippet}`.toLowerCase();
        
        Object.entries(sentimentKeywords).forEach(([sentiment, keywords]) => {
          keywords.forEach(keyword => {
            if (content.includes(keyword)) {
              totalMentions++;
              if (sentiment === 'bullish') sentimentScore += 1;
              else if (sentiment === 'bearish') sentimentScore -= 1;
            }
          });
        });
      });

      const normalizedScore = totalMentions > 0 ? sentimentScore / totalMentions : 0;
      
      return {
        score: Math.max(-1, Math.min(1, normalizedScore)),
        sentiment: normalizedScore > 0.2 ? 'bullish' : 
                  normalizedScore < -0.2 ? 'bearish' : 'neutral',
        confidence: Math.min(totalMentions * 10, 100),
        sources: results.length
      };

    } catch (error) {
      logger.error('Sentiment analysis failed:', error);
      return {
        score: 0,
        sentiment: 'neutral',
        confidence: 0,
        sources: 0
      };
    }
  }
}

module.exports = new SearchService();