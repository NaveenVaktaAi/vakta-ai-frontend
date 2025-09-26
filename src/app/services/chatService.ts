import endpoints from '../constants/endpoint';

export interface Chat {
  _id: string;
  user_id: number;
  document_id?: string;
  title: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  _id: string;
  chat_id: string;
  message: string;
  is_bot: boolean;
  reaction?: string;
  token?: number;
  type: string;
  is_edited: boolean;
  created_ts: string;
  updated_ts: string;
}

export interface CreateChatRequest {
  user_id: number;
  title: string;
  document_id?: string;
  status?: 'active' | 'inactive';
}

export interface CreateMessageRequest {
  chat_id: string;
  message: string;
  is_bot: boolean;
  reaction?: string;
  token?: number;
  type?: string;
  is_edited?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class ChatService {
  private baseUrl = 'http://127.0.0.1:5000/api/v1';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Chat Management
  async createChat(chatData: CreateChatRequest): Promise<ApiResponse<{ chat_id: string }>> {
    return this.request<ApiResponse<{ chat_id: string }>>('/chat/', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  }

  async getChat(chatId: string): Promise<Chat> {
    return this.request<Chat>(`/chat/${chatId}`);
  }

  async getUserChats(userId: number, page: number = 1, limit: number = 20): Promise<{
    chats: Chat[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.request<{
      chats: Chat[];
      total: number;
      page: number;
      limit: number;
    }>(`/chat/user/${userId}?page=${page}&limit=${limit}`);
  }

  async updateChat(chatId: string, chatData: Partial<CreateChatRequest>): Promise<ApiResponse<{}>> {
    return this.request<ApiResponse<{}>>(`/chat/${chatId}`, {
      method: 'PUT',
      body: JSON.stringify(chatData),
    });
  }

  async deleteChat(chatId: string): Promise<ApiResponse<{}>> {
    return this.request<ApiResponse<{}>>(`/chat/${chatId}`, {
      method: 'DELETE',
    });
  }

  // Message Management
  async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/chat/${chatId}/messages?page=${page}&limit=${limit}`);
  }

  async createMessage(messageData: CreateMessageRequest): Promise<ApiResponse<{ message_id: string }>> {
    return this.request<ApiResponse<{ message_id: string }>>(`/chat/${messageData.chat_id}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getMessage(chatId: string, messageId: string): Promise<ChatMessage> {
    return this.request<ChatMessage>(`/chat/${chatId}/messages/${messageId}`);
  }

  async updateMessage(
    chatId: string, 
    messageId: string, 
    messageData: Partial<CreateMessageRequest>
  ): Promise<ApiResponse<{}>> {
    return this.request<ApiResponse<{}>>(`/chat/${chatId}/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(messageData),
    });
  }

  async deleteMessage(chatId: string, messageId: string): Promise<ApiResponse<{}>> {
    return this.request<ApiResponse<{}>>(`/chat/${chatId}/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // WebSocket URL
  getWebSocketUrl(chatId: string): string {
    return `ws://localhost:5000/api/v1/chat/ws/${chatId}`;
  }
}

export const chatService = new ChatService();
export default chatService;

