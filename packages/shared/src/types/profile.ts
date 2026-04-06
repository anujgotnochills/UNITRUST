export interface UserProfile {
  walletAddress: string;
  name?: string;
  profilePic?: string;
  role: 'user';
  createdAt: string;
}

export interface InstituteProfile {
  walletAddress: string;
  instituteName: string;
  logo?: string;
  role: 'institute';
  createdAt: string;
}
