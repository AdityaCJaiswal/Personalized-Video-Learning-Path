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
  private static apiLoadPromise: Promise<void> | null = null;
  private static isApiLoaded = false;
  
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
  private onPlayerReadyCallback?: () => void;
  private onPlayerErrorCallback?: (error: string) => void;
  private progressInterval?: NodeJS.Timeout;

  constructor(
    onStateChange?: (analytics: YouTubeAnalytics) => void,
    onInteraction?: (interaction: Interaction) => void,
    onPlayerReady?: () => void,
    onPlayerError?: (error: string) => void
  ) {
    this.onStateChangeCallback = onStateChange;
    this.onInteractionCallback = onInteraction;
    this.onPlayerReadyCallback = onPlayerReady;
    this.onPlayerErrorCallback = onPlayerError;
    this.setupBehaviorTracking();
  }

  // Static method to ensure YouTube API is loaded
  static async ensureAPILoaded(): Promise<void> {
    if (YouTubeService.isApiLoaded) {
      return Promise.resolve();
    }

    if (YouTubeService.apiLoadPromise) {
      return YouTubeService.apiLoadPromise;
    }

    YouTubeService.apiLoadPromise = new Promise<void>((resolve, reject) => {
      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        YouTubeService.isApiLoaded = true;
        resolve();
        return;
      }

      // Set up the callback for when API loads
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API loaded via callback');
        YouTubeService.isApiLoaded = true;
        resolve();
      };

      // Load the API script if not already present
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        console.log('Loading YouTube API script');
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        
        script.onload = () => {
          console.log('YouTube API script loaded');
          // Fallback in case onYouTubeIframeAPIReady doesn't fire
          setTimeout(() => {
            if (window.YT && window.YT.Player) {
              console.log('YouTube API ready via script onload');
              YouTubeService.isApiLoaded = true;
              resolve();
            }
          }, 1000);
        };
        
        script.onerror = () => {
          console.error('Failed to load YouTube API script');
          reject(new Error('Failed to load YouTube API'));
        };
        
        document.head.appendChild(script);
      }

      // Timeout fallback
      setTimeout(() => {
        if (!YouTubeService.isApiLoaded) {
          console.error('YouTube API failed to load within timeout');
          reject(new Error('YouTube API timeout'));
        }
      }, 15000);
    });

    return YouTubeService.apiLoadPromise;
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

  async createPlayer(containerElement: HTMLElement, videoId: string, options: any = {}): Promise<any> {
    try {
      // Ensure API is loaded first
      await YouTubeService.ensureAPILoaded();

      // Generate unique ID for the container if it doesn't have one
      if (!containerElement.id) {
        containerElement.id = `youtube-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Destroy existing player if any
      this.destroyPlayer();

      console.log('Creating YouTube player with video ID:', videoId);

      return new Promise((resolve, reject) => {
        try {
          this.player = new window.YT.Player(containerElement.id, {
            height: options.height || '100%',
            width: options.width || '100%',
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              showinfo: 0,
              origin: window.location.origin,
              enablejsapi: 1,
              ...options.playerVars,
            },
            events: {
              onReady: (event: any) => {
                console.log('Player ready');
                this.onPlayerReady(event);
                if (this.onPlayerReadyCallback) {
                  this.onPlayerReadyCallback();
                }
                resolve(this.player);
              },
              onStateChange: this.onPlayerStateChange.bind(this),
              onPlaybackQualityChange: this.onPlaybackQualityChange.bind(this),
              onPlaybackRateChange: this.onPlaybackRateChange.bind(this),
              onError: (event: any) => {
                console.error('YouTube Player Error:', event);
                const errorMessage = this.getErrorMessage(event.data);
                if (this.onPlayerErrorCallback) {
                  this.onPlayerErrorCallback(errorMessage);
                }
                reject(new Error(errorMessage));
              },
            },
          });
        } catch (error) {
          console.error('Error creating YouTube player:', error);
          if (this.onPlayerErrorCallback) {
            this.onPlayerErrorCallback(`Failed to create player: ${error.message}`);
          }
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in createPlayer:', error);
      if (this.onPlayerErrorCallback) {
        this.onPlayerErrorCallback(`Failed to initialize player: ${error.message}`);
      }
      throw error;
    }
  }

  private getErrorMessage(errorCode: number): string {
    const errorMessages: { [key: number]: string } = {
      2: 'Invalid video ID - The video may not exist',
      5: 'HTML5 player error - Try refreshing the page',
      100: 'Video not found or is private',
      101: 'Video cannot be embedded - Try a different video',
      150: 'Video cannot be embedded - Try a different video',
    };
    
    return errorMessages[errorCode] || `Unknown player error (${errorCode})`;
  }

  destroyPlayer() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }

    if (this.player && typeof this.player.destroy === 'function') {
      try {
        console.log('Destroying YouTube player');
        this.player.destroy();
        this.player = null;
      } catch (error) {
        console.warn('Error destroying player:', error);
      }
    }
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
    // Clear any existing interval
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    // Track progress every second
    this.progressInterval = setInterval(() => {
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
    if (this.player && this.player.playVideo) {
      this.player.playVideo();
    }
  }

  pause() {
    if (this.player && this.player.pauseVideo) {
      this.player.pauseVideo();
    }
  }

  seekTo(seconds: number) {
    if (this.player && this.player.seekTo) {
      this.player.seekTo(seconds, true);
      this.trackInteraction('seek', {
        from: this.player.getCurrentTime() || 0,
        to: seconds,
        timestamp: Date.now(),
      });
    }
  }

  setPlaybackRate(rate: number) {
    if (this.player && this.player.setPlaybackRate) {
      this.player.setPlaybackRate(rate);
    }
  }

  setVolume(volume: number) {
    if (this.player && this.player.setVolume) {
      this.player.setVolume(volume);
    }
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

  isReady(): boolean {
    return this.player !== null && typeof this.player.getPlayerState === 'function';
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