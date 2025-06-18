import { WatchSession, Interaction } from '../types';

export interface YouTubePlayerState {
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  quality: string;
  isPlaying: boolean;
  bufferedPercentage: number;
}

export interface YouTubeAnalytics {
  engagementScore: number;
  attentionSpans: { start: number; end: number; intensity: number }[];
  difficultyIndicators: {
    replaySegments: { start: number; end: number; count: number }[];
    pausePatterns: { timestamp: number; duration: number; reason: string }[];
    speedChanges: { timestamp: number; from: number; to: number; reason: string }[];
  };
  comprehensionSignals: {
    consistentPlayback: boolean;
    completionLikelihood: number;
    strugglingSegments: number[];
    masteredSegments: number[];
  };
}

export class YouTubeService {
  private player: any = null;
  private sessionData: Partial<WatchSession> = {};
  private interactions: Interaction[] = [];
  private analytics: YouTubeAnalytics = this.initializeAnalytics();
  private behaviorTracking = {
    lastInteractionTime: 0,
    consecutivePauses: 0,
    seekBackCount: 0,
    speedChangeCount: 0,
    idleTime: 0,
    focusLossCount: 0,
    mouseMovements: 0,
    keyboardInteractions: 0,
  };

  private onStateChangeCallback?: (analytics: YouTubeAnalytics) => void;
  private onInteractionCallback?: (interaction: Interaction) => void;

  constructor(
    onStateChange?: (analytics: YouTubeAnalytics) => void,
    onInteraction?: (interaction: Interaction) => void
  ) {
    this.onStateChangeCallback = onStateChange;
    this.onInteractionCallback = onInteraction;
    this.initializeYouTubeAPI();
    this.setupBehaviorTracking();
  }

  private initializeAnalytics(): YouTubeAnalytics {
    return {
      engagementScore: 0,
      attentionSpans: [],
      difficultyIndicators: {
        replaySegments: [],
        pausePatterns: [],
        speedChanges: [],
      },
      comprehensionSignals: {
        consistentPlayback: false,
        completionLikelihood: 0,
        strugglingSegments: [],
        masteredSegments: [],
      },
    };
  }

  private initializeYouTubeAPI() {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready');
    };
  }

  private setupBehaviorTracking() {
    // Track mouse movements for engagement
    document.addEventListener('mousemove', () => {
      this.behaviorTracking.mouseMovements++;
      this.updateEngagementScore();
    });

    // Track keyboard interactions
    document.addEventListener('keydown', (e) => {
      this.behaviorTracking.keyboardInteractions++;
      this.trackInteraction('keyboard', { key: e.key, timestamp: Date.now() });
    });

    // Track focus/blur events
    window.addEventListener('blur', () => {
      this.behaviorTracking.focusLossCount++;
      this.trackInteraction('focus_loss', { timestamp: Date.now() });
    });

    window.addEventListener('focus', () => {
      this.trackInteraction('focus_gain', { timestamp: Date.now() });
    });

    // Track idle time
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        this.behaviorTracking.idleTime += 30; // 30 seconds of idle
        this.trackInteraction('idle', { duration: 30, timestamp: Date.now() });
      }, 30000);
    };

    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keypress', resetIdleTimer);
  }

  createPlayer(elementId: string, videoId: string, options: any = {}) {
    return new Promise((resolve, reject) => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(() => this.createPlayer(elementId, videoId, options), 100);
        return;
      }

      this.player = new window.YT.Player(elementId, {
        height: options.height || '390',
        width: options.width || '640',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0, // Hide default controls to use our custom UI
          disablekb: 1, // Disable keyboard controls
          fs: 0, // Disable fullscreen
          iv_load_policy: 3, // Hide annotations
          modestbranding: 1, // Minimal YouTube branding
          playsinline: 1,
          rel: 0, // Don't show related videos
          showinfo: 0, // Hide video info
          ...options.playerVars,
        },
        events: {
          onReady: (event: any) => {
            this.onPlayerReady(event);
            resolve(this.player);
          },
          onStateChange: this.onPlayerStateChange.bind(this),
          onPlaybackQualityChange: this.onPlaybackQualityChange.bind(this),
          onPlaybackRateChange: this.onPlaybackRateChange.bind(this),
          onError: (event: any) => {
            console.error('YouTube Player Error:', event);
            reject(event);
          },
        },
      });
    });
  }

  private onPlayerReady(event: any) {
    console.log('YouTube Player Ready');
    this.sessionData = {
      videoId: this.getVideoId(),
      startTime: new Date(),
      totalDuration: this.player.getDuration(),
      watchedDuration: 0,
      completionRate: 0,
      interactions: [],
    };

    // Start tracking session
    this.startSessionTracking();
  }

  private onPlayerStateChange(event: any) {
    const state = event.data;
    const currentTime = this.player.getCurrentTime();
    const timestamp = Date.now();

    switch (state) {
      case window.YT.PlayerState.PLAYING:
        this.trackInteraction('play', { currentTime, timestamp });
        this.analyzePlaybackPattern('play', currentTime);
        break;
      case window.YT.PlayerState.PAUSED:
        this.trackInteraction('pause', { currentTime, timestamp });
        this.analyzePlaybackPattern('pause', currentTime);
        this.behaviorTracking.consecutivePauses++;
        break;
      case window.YT.PlayerState.ENDED:
        this.trackInteraction('ended', { currentTime, timestamp });
        this.finalizeSession();
        break;
      case window.YT.PlayerState.BUFFERING:
        this.trackInteraction('buffering', { currentTime, timestamp });
        break;
    }

    this.updateAnalytics();
  }

  private onPlaybackQualityChange(event: any) {
    this.trackInteraction('quality_change', {
      quality: event.data,
      timestamp: Date.now(),
      currentTime: this.player.getCurrentTime(),
    });
  }

  private onPlaybackRateChange(event: any) {
    const newRate = event.data;
    const currentTime = this.player.getCurrentTime();
    
    this.trackInteraction('speed_change', {
      from: this.behaviorTracking.speedChangeCount > 0 ? 1.0 : newRate,
      to: newRate,
      currentTime,
      timestamp: Date.now(),
    });

    this.behaviorTracking.speedChangeCount++;
    this.analyzeSpeedChangeReason(newRate, currentTime);
  }

  private startSessionTracking() {
    // Track progress every second
    setInterval(() => {
      if (this.player && this.player.getPlayerState() === window.YT.PlayerState.PLAYING) {
        const currentTime = this.player.getCurrentTime();
        const duration = this.player.getDuration();
        
        this.sessionData.watchedDuration = currentTime;
        this.sessionData.completionRate = currentTime / duration;
        
        this.analyzeViewingPattern(currentTime);
        this.updateEngagementScore();
      }
    }, 1000);

    // Track detailed analytics every 5 seconds
    setInterval(() => {
      this.updateComprehensionSignals();
      this.detectLearningDifficulties();
    }, 5000);
  }

  private trackInteraction(type: string, data: any) {
    const interaction: Interaction = {
      type: type as any,
      timestamp: data.timestamp || Date.now(),
      value: data,
    };

    this.interactions.push(interaction);
    this.behaviorTracking.lastInteractionTime = Date.now();

    // Call callback if provided
    if (this.onInteractionCallback) {
      this.onInteractionCallback(interaction);
    }

    // Analyze interaction patterns
    this.analyzeInteractionPattern(interaction);
  }

  private analyzePlaybackPattern(action: string, currentTime: number) {
    if (action === 'pause') {
      // Analyze pause patterns to detect difficulty
      const recentPauses = this.interactions
        .filter(i => i.type === 'pause' && i.timestamp > Date.now() - 60000)
        .length;

      if (recentPauses > 3) {
        this.analytics.difficultyIndicators.pausePatterns.push({
          timestamp: currentTime,
          duration: 0, // Will be updated when play resumes
          reason: 'frequent_pauses_difficulty',
        });
      }
    }

    if (action === 'play') {
      // Update pause duration if there was a recent pause
      const lastPause = this.analytics.difficultyIndicators.pausePatterns
        .find(p => p.duration === 0);
      
      if (lastPause) {
        lastPause.duration = Date.now() - (lastPause.timestamp * 1000);
      }
    }
  }

  private analyzeSpeedChangeReason(newRate: number, currentTime: number) {
    let reason = 'user_preference';

    if (newRate > 1.0) {
      // User speeding up - might indicate:
      // 1. Content is too easy
      // 2. User is confident
      // 3. Review/familiar content
      const recentSpeedChanges = this.analytics.difficultyIndicators.speedChanges
        .filter(sc => sc.timestamp > currentTime - 60);

      if (recentSpeedChanges.length === 0) {
        reason = 'content_too_easy';
      } else {
        reason = 'confident_learning';
      }
    } else if (newRate < 1.0) {
      // User slowing down - might indicate:
      // 1. Content is difficult
      // 2. Important information
      // 3. Need more time to process
      reason = 'content_difficult';
    }

    this.analytics.difficultyIndicators.speedChanges.push({
      timestamp: currentTime,
      from: 1.0, // Simplified
      to: newRate,
      reason,
    });
  }

  private analyzeViewingPattern(currentTime: number) {
    // Detect seeking behavior
    const lastInteraction = this.interactions[this.interactions.length - 1];
    if (lastInteraction && lastInteraction.type === 'seek') {
      const seekDirection = lastInteraction.value.to - lastInteraction.value.from;
      
      if (seekDirection < -5) {
        // Seeking backward - indicates difficulty or missed information
        this.behaviorTracking.seekBackCount++;
        this.analytics.comprehensionSignals.strugglingSegments.push(currentTime);
      }
    }

    // Track attention spans
    const isEngaged = this.behaviorTracking.mouseMovements > 0 || 
                     this.behaviorTracking.keyboardInteractions > 0;
    
    if (isEngaged) {
      const currentSpan = this.analytics.attentionSpans[this.analytics.attentionSpans.length - 1];
      if (currentSpan && currentSpan.end === -1) {
        currentSpan.end = currentTime;
        currentSpan.intensity = this.calculateAttentionIntensity();
      } else {
        this.analytics.attentionSpans.push({
          start: currentTime,
          end: -1,
          intensity: 0,
        });
      }
    }

    // Reset behavior counters
    this.behaviorTracking.mouseMovements = 0;
    this.behaviorTracking.keyboardInteractions = 0;
  }

  private calculateAttentionIntensity(): number {
    // Calculate based on various factors
    const factors = {
      mouseActivity: Math.min(this.behaviorTracking.mouseMovements / 10, 1),
      keyboardActivity: Math.min(this.behaviorTracking.keyboardInteractions / 5, 1),
      playbackConsistency: this.behaviorTracking.consecutivePauses < 2 ? 1 : 0.5,
      focusRetention: this.behaviorTracking.focusLossCount < 1 ? 1 : 0.7,
    };

    return Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length;
  }

  private updateEngagementScore() {
    const factors = {
      watchTime: Math.min(this.sessionData.completionRate || 0, 1) * 30,
      interactionFrequency: Math.min(this.interactions.length / 10, 1) * 20,
      attentionSpans: this.analytics.attentionSpans.length > 0 ? 
        this.analytics.attentionSpans.reduce((sum, span) => sum + span.intensity, 0) / this.analytics.attentionSpans.length * 25 : 0,
      consistentPlayback: this.behaviorTracking.consecutivePauses < 3 ? 15 : 5,
      focusRetention: Math.max(0, 10 - this.behaviorTracking.focusLossCount * 2),
    };

    this.analytics.engagementScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
  }

  private updateComprehensionSignals() {
    const currentTime = this.player?.getCurrentTime() || 0;
    const duration = this.player?.getDuration() || 1;
    const progress = currentTime / duration;

    // Consistent playback indicator
    this.analytics.comprehensionSignals.consistentPlayback = 
      this.behaviorTracking.consecutivePauses < 3 && this.behaviorTracking.seekBackCount < 2;

    // Completion likelihood based on current behavior
    let likelihood = progress * 0.4; // Base on current progress
    
    if (this.analytics.engagementScore > 70) likelihood += 0.3;
    if (this.behaviorTracking.consecutivePauses < 2) likelihood += 0.2;
    if (this.behaviorTracking.focusLossCount < 1) likelihood += 0.1;
    
    this.analytics.comprehensionSignals.completionLikelihood = Math.min(likelihood, 1);

    // Identify mastered segments (smooth playback, no replays)
    if (this.analytics.comprehensionSignals.consistentPlayback && 
        !this.analytics.comprehensionSignals.strugglingSegments.includes(Math.floor(currentTime / 30) * 30)) {
      const segment = Math.floor(currentTime / 30) * 30;
      if (!this.analytics.comprehensionSignals.masteredSegments.includes(segment)) {
        this.analytics.comprehensionSignals.masteredSegments.push(segment);
      }
    }
  }

  private detectLearningDifficulties() {
    const currentTime = this.player?.getCurrentTime() || 0;
    
    // Detect struggling patterns
    const recentPauses = this.interactions
      .filter(i => i.type === 'pause' && i.timestamp > Date.now() - 120000)
      .length;
    
    const recentSeekBacks = this.interactions
      .filter(i => i.type === 'seek' && i.value.to < i.value.from && i.timestamp > Date.now() - 120000)
      .length;

    if (recentPauses > 4 || recentSeekBacks > 2) {
      const segment = Math.floor(currentTime / 30) * 30;
      if (!this.analytics.comprehensionSignals.strugglingSegments.includes(segment)) {
        this.analytics.comprehensionSignals.strugglingSegments.push(segment);
      }
    }
  }

  private analyzeInteractionPattern(interaction: Interaction) {
    // Pattern analysis for AI recommendations
    const recentInteractions = this.interactions.slice(-10);
    
    // Detect learning style preferences
    const seekPatterns = recentInteractions.filter(i => i.type === 'seek');
    const pausePatterns = recentInteractions.filter(i => i.type === 'pause');
    const speedPatterns = recentInteractions.filter(i => i.type === 'speed_change');

    // This data will be used by the AI recommendation engine
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.analytics);
    }
  }

  private updateAnalytics() {
    this.updateEngagementScore();
    this.updateComprehensionSignals();
    
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.analytics);
    }
  }

  private finalizeSession() {
    this.sessionData.endTime = new Date();
    this.sessionData.interactions = this.interactions;
    
    // Generate final analytics report
    const finalReport = {
      ...this.analytics,
      sessionSummary: {
        totalInteractions: this.interactions.length,
        engagementLevel: this.categorizeEngagement(this.analytics.engagementScore),
        learningEfficiency: this.calculateLearningEfficiency(),
        recommendedNextActions: this.generateRecommendations(),
      },
    };

    console.log('Session completed:', finalReport);
    return finalReport;
  }

  private categorizeEngagement(score: number): string {
    if (score >= 80) return 'highly_engaged';
    if (score >= 60) return 'moderately_engaged';
    if (score >= 40) return 'somewhat_engaged';
    return 'low_engagement';
  }

  private calculateLearningEfficiency(): number {
    const completionRate = this.sessionData.completionRate || 0;
    const engagementScore = this.analytics.engagementScore / 100;
    const comprehensionScore = this.analytics.comprehensionSignals.consistentPlayback ? 1 : 0.5;
    
    return (completionRate * 0.4 + engagementScore * 0.4 + comprehensionScore * 0.2) * 100;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.analytics.engagementScore < 50) {
      recommendations.push('try_shorter_videos');
      recommendations.push('interactive_content');
    }
    
    if (this.behaviorTracking.seekBackCount > 3) {
      recommendations.push('prerequisite_review');
      recommendations.push('slower_paced_content');
    }
    
    if (this.analytics.comprehensionSignals.completionLikelihood > 0.8) {
      recommendations.push('advanced_topics');
      recommendations.push('challenge_content');
    }
    
    return recommendations;
  }

  // Public methods for controlling the player
  play() {
    this.player?.playVideo();
  }

  pause() {
    this.player?.pauseVideo();
  }

  seekTo(seconds: number) {
    this.player?.seekTo(seconds);
    this.trackInteraction('seek', {
      from: this.player?.getCurrentTime() || 0,
      to: seconds,
      timestamp: Date.now(),
    });
  }

  setPlaybackRate(rate: number) {
    this.player?.setPlaybackRate(rate);
  }

  getCurrentTime(): number {
    return this.player?.getCurrentTime() || 0;
  }

  getDuration(): number {
    return this.player?.getDuration() || 0;
  }

  getVideoId(): string {
    return this.player?.getVideoData()?.video_id || '';
  }

  getPlayerState(): number {
    return this.player?.getPlayerState() || -1;
  }

  getAnalytics(): YouTubeAnalytics {
    return this.analytics;
  }

  getSessionData(): Partial<WatchSession> {
    return {
      ...this.sessionData,
      interactions: this.interactions,
    };
  }
}

// Global YouTube API ready handler
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}