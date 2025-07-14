
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'PARENT' | 'PLAYER';
      parentId?: string;
      playerProfile?: any;
      children?: any[];
      parent?: any;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'PARENT' | 'PLAYER';
    parentId?: string;
    playerProfile?: any;
    children?: any[];
    parent?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'PARENT' | 'PLAYER';
    parentId?: string;
    playerProfile?: any;
    children?: any[];
    parent?: any;
  }
}
