import Login from '@/components/auth/Login';

export default function LoginPage() {
  return (
    <main className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full filter blur-3xl animate-pulse [animation-delay:400ms]"></div>
      <div className="relative z-10">
        <Login />
      </div>
    </main>
  );
}
