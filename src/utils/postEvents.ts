// Event system for cross-component post updates
export interface PostCreatedEvent {
  post: any;
  source: 'profile' | 'community';
}

export class PostEventManager {
  private static instance: PostEventManager;
  private listeners: ((event: PostCreatedEvent) => void)[] = [];

  private constructor() {}

  static getInstance(): PostEventManager {
    if (!PostEventManager.instance) {
      PostEventManager.instance = new PostEventManager();
    }
    return PostEventManager.instance;
  }

  // Add a listener for post creation events
  addListener(listener: (event: PostCreatedEvent) => void): () => void {
    this.listeners.push(listener);
    
    // Return an unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Emit a post creation event
  emitPostCreated(event: PostCreatedEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in post creation event listener:', error);
      }
    });
  }

  // Clear all listeners (useful for testing)
  clearListeners(): void {
    this.listeners = [];
  }
}

// Export a singleton instance
export const postEventManager = PostEventManager.getInstance();











