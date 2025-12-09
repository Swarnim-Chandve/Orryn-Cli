'use client';

import Image from 'next/image';
import loginIllustration from '@/public/login.svg';
import {Button} from './ui/button';
import {Card, CardContent} from './ui/card';
import {authClient} from '@/lib/auth-client';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import githubIcon from '@/public/github.svg';


export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <Image src={loginIllustration} alt="login illustration" width={500} height={500} priority />

        <h1 className="text-6xl font-extrabold text-indigo-400">
            Welcome Back!! 🎉
            to Orryn CLI 🚀
        </h1>



        <p className="text-base font-medium text-zinc-400">
          Login to your account for allowing device flow
        </p>
      </div>


      <Card className="border-2 border-dashed">
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-3"
                type="button"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  authClient
                    .signIn.social({
                      provider: 'github',
                      callbackURL: 'http://localhost:3000',
                    })
                    .catch(() => setLoading(false));
                }}
              >
                <Image src={githubIcon} alt="github" width={20} height={20} className="dark:invert" />
                {loading ? 'Redirecting…' : 'Continue with GitHub'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}