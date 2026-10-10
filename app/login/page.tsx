'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Waves,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor, ingrese usuario/email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        // Redirigir a la URL solicitada o a la raíz
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError(res.error || 'Credenciales inválidas.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de comunicación con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1 w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Luces y degradados ambientales de fondo */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <Card className="border-border/60 bg-card/85 backdrop-blur-xl shadow-2xl transition-all">
          <CardHeader className="space-y-3 pb-6 text-center">
            {/* Logotipo */}
            <div className="mx-auto size-14 rounded-2xl bg-gradient-to-tr from-primary to-cyan-500 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Waves className="size-7" />
            </div>

            <div>
              <CardTitle className="font-heading text-2xl font-bold tracking-tight">
                AquaMetrics
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Sistema de Monitoreo de Pozos de Agua
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pb-5">
              {/* Alerta de Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg text-xs bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in zoom-in-95 duration-200">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <p className="flex-1 font-medium">{error}</p>
                </div>
              )}

              {/* Campo Usuario / Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Usuario o Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="Usuario o correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs h-10 bg-background/50 focus:bg-background"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-1.5 mb-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Contraseña
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 text-xs h-10 bg-background/50 focus:bg-background"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-5 pb-6">
              <Button
                type="submit"
                className="w-full font-semibold text-xs h-10 shadow-sm cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Validando credenciales...
                  </>
                ) : (
                  <>
                    Ingresar al Sistema
                    <ArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
