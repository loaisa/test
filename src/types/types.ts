// Интерфейс для структуры поста
export interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    fullName: string;
    avatarUrl: string;
  };
  createdAt: string;
}

export interface Post {
    _id: string;
    title: string;
    text: string;
    tags: string[];
    viewsCount: number;
    user: {
      _id: string;
      fullName: string;
      avatarUrl: string;
    };
    imageUrl: string;
    createdAt: string;
    likesCount: number;
    likedBy: string[]; // Массив ID пользователей, которые поставили лайк
    comments: Comment[]; // Массив комментариев к посту
  }
  
  export interface CreatePostData {
    title: string;
    text: string;
    tags: string[];
    imageUrl?: string;
}