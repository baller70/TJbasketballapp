export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'motivation' | 'perseverance' | 'teamwork' | 'growth' | 'success' | 'practice';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageGroup: 'youth' | 'teen' | 'adult' | 'all';
}

export const basketballQuotes: Quote[] = [
  // Motivation Quotes
  {
    id: 'quote-1',
    text: "I've missed more than 9,000 shots in my career. I've lost almost 300 games. 26 times I've been trusted to take the game winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.",
    author: 'Michael Jordan',
    category: 'motivation',
    tags: ['failure', 'success', 'perseverance'],
    difficulty: 'intermediate',
    ageGroup: 'teen'
  },
  {
    id: 'quote-2',
    text: "Hard work beats talent when talent doesn't work hard.",
    author: 'Tim Notke',
    category: 'practice',
    tags: ['hard work', 'talent', 'effort'],
    difficulty: 'beginner',
    ageGroup: 'all'
  },
  {
    id: 'quote-3',
    text: "The strength of the team is each individual member. The strength of each member is the team.",
    author: 'Phil Jackson',
    category: 'teamwork',
    tags: ['team', 'unity', 'strength'],
    difficulty: 'intermediate',
    ageGroup: 'all'
  },
  {
    id: 'quote-4',
    text: "Champions aren't made in gyms. Champions are made from something deep inside them - a desire, a dream, a vision.",
    author: 'Muhammad Ali',
    category: 'motivation',
    tags: ['champions', 'dreams', 'vision'],
    difficulty: 'advanced',
    ageGroup: 'teen'
  },
  {
    id: 'quote-5',
    text: "Practice like you've never won. Play like you've never lost.",
    author: 'Unknown',
    category: 'practice',
    tags: ['practice', 'humility', 'dedication'],
    difficulty: 'beginner',
    ageGroup: 'all'
  },
  {
    id: 'quote-6',
    text: "You miss 100% of the shots you don't take.",
    author: 'Wayne Gretzky',
    category: 'motivation',
    tags: ['opportunity', 'courage', 'action'],
    difficulty: 'beginner',
    ageGroup: 'all'
  },
  {
    id: 'quote-7',
    text: "It's not about the size of the dog in the fight, it's about the size of the fight in the dog.",
    author: 'Mark Twain',
    category: 'perseverance',
    tags: ['determination', 'heart', 'courage'],
    difficulty: 'intermediate',
    ageGroup: 'youth'
  },
  {
    id: 'quote-8',
    text: "Excellence is not a skill. It's an attitude.",
    author: 'Ralph Marston',
    category: 'growth',
    tags: ['excellence', 'attitude', 'mindset'],
    difficulty: 'intermediate',
    ageGroup: 'teen'
  },
  {
    id: 'quote-9',
    text: "The way to get started is to quit talking and begin doing.",
    author: 'Walt Disney',
    category: 'motivation',
    tags: ['action', 'starting', 'doing'],
    difficulty: 'beginner',
    ageGroup: 'all'
  },
  {
    id: 'quote-10',
    text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.",
    author: 'Pelé',
    category: 'success',
    tags: ['success', 'hard work', 'love', 'sacrifice'],
    difficulty: 'advanced',
    ageGroup: 'teen'
  },
  {
    id: 'quote-11',
    text: "Don't let what you cannot do interfere with what you can do.",
    author: 'John Wooden',
    category: 'growth',
    tags: ['focus', 'limitations', 'potential'],
    difficulty: 'intermediate',
    ageGroup: 'all'
  },
  {
    id: 'quote-12',
    text: "The game has its ups and downs, but you can never lose focus of your individual goals and you can't let yourself be beat because of lack of effort.",
    author: 'Michael Jordan',
    category: 'perseverance',
    tags: ['focus', 'effort', 'goals'],
    difficulty: 'advanced',
    ageGroup: 'teen'
  },
  {
    id: 'quote-13',
    text: "Basketball is like life, it requires perseverance, self-denial, hard work, sacrifice, dedication and respect for authority.",
    author: 'Morgan Wootten',
    category: 'growth',
    tags: ['life lessons', 'character', 'values'],
    difficulty: 'advanced',
    ageGroup: 'teen'
  },
  {
    id: 'quote-14',
    text: "I can accept failure, everyone fails at something. But I can't accept not trying.",
    author: 'Michael Jordan',
    category: 'perseverance',
    tags: ['failure', 'trying', 'effort'],
    difficulty: 'intermediate',
    ageGroup: 'all'
  },
  {
    id: 'quote-15',
    text: "The most important thing is to try and inspire people so that they can be great at whatever they want to do.",
    author: 'Kobe Bryant',
    category: 'motivation',
    tags: ['inspiration', 'greatness', 'potential'],
    difficulty: 'intermediate',
    ageGroup: 'all'
  },
  {
    id: 'quote-16',
    text: "Good things come to those who wait, but better things come to those who work for it.",
    author: 'Unknown',
    category: 'practice',
    tags: ['work', 'patience', 'effort'],
    difficulty: 'beginner',
    ageGroup: 'all'
  },
  {
    id: 'quote-17',
    text: "Champions train, losers complain.",
    author: 'Unknown',
    category: 'practice',
    tags: ['training', 'attitude', 'winners'],
    difficulty: 'beginner',
    ageGroup: 'youth'
  },
  {
    id: 'quote-18',
    text: "You don't have to be great to get started, but you have to get started to be great.",
    author: 'Les Brown',
    category: 'growth',
    tags: ['starting', 'progress', 'greatness'],
    difficulty: 'beginner',
    ageGroup: 'all'
  },
  {
    id: 'quote-19',
    text: "Individual commitment to a group effort - that is what makes a team work, a company work, a society work, a civilization work.",
    author: 'Vince Lombardi',
    category: 'teamwork',
    tags: ['commitment', 'team', 'effort'],
    difficulty: 'advanced',
    ageGroup: 'teen'
  },
  {
    id: 'quote-20',
    text: "The best way to make your dreams come true is to wake up.",
    author: 'Paul Valéry',
    category: 'motivation',
    tags: ['dreams', 'action', 'reality'],
    difficulty: 'intermediate',
    ageGroup: 'all'
  }
];

export class QuoteManager {
  private quotes: Quote[] = basketballQuotes;
  
  // Get a random quote
  getRandomQuote(): Quote {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[randomIndex];
  }
  
  // Get a quote by category
  getQuoteByCategory(category: Quote['category']): Quote {
    const categoryQuotes = this.quotes.filter(quote => quote.category === category);
    if (categoryQuotes.length === 0) return this.getRandomQuote();
    
    const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
    return categoryQuotes[randomIndex];
  }
  
  // Get a quote based on user's skill level and age
  getPersonalizedQuote(skillLevel: 'beginner' | 'intermediate' | 'advanced', ageGroup: 'youth' | 'teen' | 'adult'): Quote {
    const suitableQuotes = this.quotes.filter(quote => 
      (quote.difficulty === skillLevel || quote.difficulty === 'beginner') &&
      (quote.ageGroup === ageGroup || quote.ageGroup === 'all')
    );
    
    if (suitableQuotes.length === 0) return this.getRandomQuote();
    
    const randomIndex = Math.floor(Math.random() * suitableQuotes.length);
    return suitableQuotes[randomIndex];
  }
  
  // Get a quote based on recent activity
  getContextualQuote(recentActivity: {
    completedDrills: number;
    currentStreak: number;
    recentRatings: number[];
    strugglingAreas: string[];
  }): Quote {
    const { completedDrills, currentStreak, recentRatings, strugglingAreas } = recentActivity;
    
    // If struggling, provide motivation
    if (recentRatings.length > 0 && recentRatings.some(rating => rating <= 2)) {
      return this.getQuoteByCategory('perseverance');
    }
    
    // If on a streak, provide success quotes
    if (currentStreak >= 3) {
      return this.getQuoteByCategory('success');
    }
    
    // If just starting, provide motivational quotes
    if (completedDrills < 5) {
      return this.getQuoteByCategory('motivation');
    }
    
    // If actively practicing, provide practice quotes
    if (completedDrills > 0) {
      return this.getQuoteByCategory('practice');
    }
    
    // Default to growth quotes
    return this.getQuoteByCategory('growth');
  }
  
  // Get daily quote based on date and user profile
  getDailyQuote(date: Date, userProfile: {
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    ageGroup: 'youth' | 'teen' | 'adult';
    recentActivity: {
      completedDrills: number;
      currentStreak: number;
      recentRatings: number[];
      strugglingAreas: string[];
    };
  }): Quote {
    // Use date as seed for consistent daily quote
    const dateString = date.toISOString().split('T')[0];
    const seed = dateString.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    // Create deterministic randomness based on date
    const dayOfWeek = date.getDay();
    const categories: Quote['category'][] = ['motivation', 'perseverance', 'teamwork', 'growth', 'success', 'practice'];
    const categoryIndex = (seed + dayOfWeek) % categories.length;
    const selectedCategory = categories[categoryIndex];
    
    // Get quotes from selected category that match user profile
    const categoryQuotes = this.quotes.filter(quote => 
      quote.category === selectedCategory &&
      (quote.difficulty === userProfile.skillLevel || quote.difficulty === 'beginner') &&
      (quote.ageGroup === userProfile.ageGroup || quote.ageGroup === 'all')
    );
    
    if (categoryQuotes.length === 0) {
      return this.getPersonalizedQuote(userProfile.skillLevel, userProfile.ageGroup);
    }
    
    // Use seed to select consistent quote for the day
    const quoteIndex = seed % categoryQuotes.length;
    return categoryQuotes[quoteIndex];
  }
  
  // Get quotes by tags
  getQuotesByTags(tags: string[]): Quote[] {
    return this.quotes.filter(quote => 
      tags.some(tag => quote.tags.includes(tag))
    );
  }
  
  // Get all quotes by category
  getQuotesByCategory(category: Quote['category']): Quote[] {
    return this.quotes.filter(quote => quote.category === category);
  }
  
  // Get quotes for specific difficulty
  getQuotesByDifficulty(difficulty: Quote['difficulty']): Quote[] {
    return this.quotes.filter(quote => quote.difficulty === difficulty);
  }
  
  // Get quotes for specific age group
  getQuotesByAgeGroup(ageGroup: Quote['ageGroup']): Quote[] {
    return this.quotes.filter(quote => quote.ageGroup === ageGroup || quote.ageGroup === 'all');
  }
  
  // Get quote categories
  getCategories(): Quote['category'][] {
    return ['motivation', 'perseverance', 'teamwork', 'growth', 'success', 'practice'];
  }
  
  // Get quote statistics
  getStatistics() {
    const categories = this.getCategories();
    const stats = {
      total: this.quotes.length,
      byCategory: {} as Record<Quote['category'], number>,
      byDifficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      },
      byAgeGroup: {
        youth: 0,
        teen: 0,
        adult: 0,
        all: 0
      }
    };
    
    categories.forEach(category => {
      stats.byCategory[category] = this.quotes.filter(q => q.category === category).length;
    });
    
    this.quotes.forEach(quote => {
      stats.byDifficulty[quote.difficulty]++;
      stats.byAgeGroup[quote.ageGroup]++;
    });
    
    return stats;
  }
}

export const quoteManager = new QuoteManager(); 