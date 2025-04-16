// Интерфейс для структуры поста
export interface Post {
    _id: string;
    title: string;
    text: string;
    tags: string[];
    viewsCount: number;
    user: {
      _id: string;
      fullName: string;
    };
    imageUrl: string;
    createdAt: string;
    likesCount: number;
    likedBy: string[]; // Массив ID пользователей, которые поставили лайк
  }
  
  export interface CreatePostData {
    title: string;
    text: string;
    tags: string[];
    imageUrl?: string;
}