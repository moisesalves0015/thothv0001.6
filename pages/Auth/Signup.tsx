
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2, AlertCircle, School, Check, ChevronLeft, AtSign, Phone } from 'lucide-react';
import { AuthService } from '../../modules/auth/auth.service';
import { UserService } from '../../modules/user/user.service';

const UNIVERSITIES = [
  "UERJ - Universidade do Estado do Rio de Janeiro"
];

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [university, setUniversity] = useState(UNIVERSITIES[0]);

  // Validation States
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isUserAvailable, setIsUserAvailable] = useState<boolean | null>(null);

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);

  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [isPhoneAvailable, setIsPhoneAvailable] = useState<boolean | null>(null);

  const navigate = useNavigate();

  // Helper: Capitalize First Letter of Each Word
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const capitalized = val.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
    setFullName(capitalized);
  };

  // Helper: Phone Mask for Brazil (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);

    if (val.length > 10) {
      val = val.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (val.length > 6) {
      val = val.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (val.length > 2) {
      val = val.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }
    setPhoneNumber(val);
  };

  // Phone Availability Check Debounce
  useEffect(() => {
    const checkPhone = async () => {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setIsPhoneAvailable(null);
        return;
      }
      setIsCheckingPhone(true);
      try {
        const available = await UserService.checkPhoneAvailability(cleanPhone);
        setIsPhoneAvailable(available);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingPhone(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (step === 2 && phoneNumber) checkPhone();
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [phoneNumber, step]);

  // Email Availability Check Debounce
  useEffect(() => {
    const checkEmail = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setIsEmailAvailable(null);
        return;
      }
      setIsCheckingEmail(true);
      try {
        // Usa o UserService (Firestore) para verificar disponibilidade real
        // pois o check do Auth pode falhar silenciosamente se enumeração estiver desligada
        const available = await UserService.checkEmailAvailability(email);
        setIsEmailAvailable(available);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (step === 1 && email) checkEmail();
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [email, step]);

  // Username Availability Check Debounce
  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setIsUserAvailable(null);
        return;
      }
      setIsCheckingUser(true);
      try {
        const available = await UserService.checkUsernameAvailability(username);
        setIsUserAvailable(available);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingUser(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (step === 2 && username) checkUsername();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, step]);

  const validatePassword = (pass: string) => {
    // Pelo menos 6 chars, 1 numero, 1 especial
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasLength = pass.length >= 6;
    return { hasNumber, hasSpecial, hasLength, isValid: hasNumber && hasSpecial && hasLength };
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      const pwdCheck = validatePassword(password);
      if (!email || !pwdCheck.isValid) {
        setError("Verifique os requisitos de email e senha.");
        return;
      }
      if (isEmailAvailable === false) {
        setError("Este email já está cadastrado.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (!fullName || !username || cleanPhone.length < 10) {
        setError("Preencha todos os campos corretamente. Telefone inválido.");
        return;
      }
      if (isUserAvailable === false) {
        setError("Este nome de usuário já está em uso.");
        return;
      }
      if (isPhoneAvailable === false) {
        setError("Este telefone já está cadastrado.");
        return;
      }
      setStep(3);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Criar Auth User
      const firebaseUser = await AuthService.register(fullName.trim(), email.trim(), password);

      // 2. Criar Perfil Completo
      await UserService.createCompleteProfile({
        uid: firebaseUser.uid,
        email: email.trim(),
        fullName: fullName.trim(),
        username: username.trim(),
        phoneNumber: phoneNumber.trim(),
        university
      });

      navigate('/onboarding');
    } catch (err) {
      const error = err as { code?: string; message?: string };
      console.error("Signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está sendo utilizado.');
        setStep(1); // Voltar para corrigir email
      } else {
        setError('Falha ao cadastrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => {
    const pwdCheck = validatePassword(password);
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail Institucional</label>
          <div className="relative group">
            <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isEmailAvailable === false ? 'text-red-500' : 'text-slate-300'} group-focus-within:text-[#006c55]`} size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@uerj.br"
              className={`w-full h-12 pl-12 pr-10 bg-white/50 border rounded-2xl text-[16px] font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 transition-all ${isEmailAvailable === false
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                : 'border-white/60 focus:border-[#006c55] focus:ring-[#006c55]/10 focus:bg-white'
                }`}
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isCheckingEmail ? (
                <Loader2 className="animate-spin text-slate-400" size={16} />
              ) : isEmailAvailable === true ? (
                <Check className="text-[#006c55]" size={16} />
              ) : isEmailAvailable === false ? (
                <AlertCircle className="text-red-500" size={16} />
              ) : null}
            </div>
          </div>
          {isEmailAvailable === false && (
            <p className="text-[10px] text-red-500 font-bold ml-1">Email já cadastrado. <Link to="/login" className="underline">Fazer login?</Link></p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Senha de Acesso</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55] transition-colors" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full h-12 pl-12 pr-4 bg-white/50 border border-white/60 rounded-2xl text-[16px] font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] focus:bg-white transition-all"
            />
          </div>
          {/* Password Requirements */}
          {password && (
            <div className="flex flex-col gap-1 mt-2 ml-1">
              <div className={`text-[10px] font-bold flex items-center gap-1.5 ${pwdCheck.hasLength ? 'text-[#006c55]' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${pwdCheck.hasLength ? 'bg-[#006c55]' : 'bg-slate-300'}`}></div>
                Mínimo 6 caracteres
              </div>
              <div className={`text-[10px] font-bold flex items-center gap-1.5 ${pwdCheck.hasNumber ? 'text-[#006c55]' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${pwdCheck.hasNumber ? 'bg-[#006c55]' : 'bg-slate-300'}`}></div>
                Pelo menos 1 número
              </div>
              <div className={`text-[10px] font-bold flex items-center gap-1.5 ${pwdCheck.hasSpecial ? 'text-[#006c55]' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${pwdCheck.hasSpecial ? 'bg-[#006c55]' : 'bg-slate-300'}`}></div>
                Pelo menos 1 caractere especial (!@#$...)
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleNextStep}
          disabled={!email || !pwdCheck.isValid || isEmailAvailable === false}
          className="w-full h-14 bg-[#006c55] hover:bg-[#005a46] disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#006c55]/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
        >
          Continuar <ArrowRight size={18} />
        </button>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55] transition-colors" size={18} />
          <input
            type="text"
            required
            value={fullName}
            onChange={handleNameChange}
            placeholder="Para certificados e identificação"
            className="w-full h-12 pl-12 pr-4 bg-white/50 border border-white/60 rounded-2xl text-[16px] font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] focus:bg-white transition-all"
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone / WhatsApp</label>
        <div className="relative group">
          <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPhoneAvailable === false ? 'text-red-500' : 'text-slate-300'} group-focus-within:text-[#006c55]`} size={18} />
          <input
            type="tel"
            required
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="(21) 99999-9999"
            maxLength={15}
            className={`w-full h-12 pl-12 pr-10 bg-white/50 border rounded-2xl text-[16px] font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 transition-all ${isPhoneAvailable === false
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
              : 'border-white/60 focus:border-[#006c55] focus:ring-[#006c55]/10 focus:bg-white'
              }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isCheckingPhone ? (
              <Loader2 className="animate-spin text-slate-400" size={16} />
            ) : isPhoneAvailable === true ? (
              <Check className="text-[#006c55]" size={16} />
            ) : isPhoneAvailable === false ? (
              <AlertCircle className="text-red-500" size={16} />
            ) : null}
          </div>
        </div>
        {isPhoneAvailable === false && (
          <p className="text-[10px] text-red-500 font-bold ml-1">Telefone já cadastrado.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Seu @usuario único</label>
        <div className="relative group">
          <AtSign className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isUserAvailable === true ? 'text-[#006c55]' : isUserAvailable === false ? 'text-red-500' : 'text-slate-300'} group-focus-within:text-[#006c55]`} size={18} />
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase())}
            placeholder="Ex: moises.alves"
            className={`w-full h-12 pl-12 pr-10 bg-white/50 border rounded-2xl text-[16px] font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 transition-all ${isUserAvailable === false
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
              : 'border-white/60 focus:border-[#006c55] focus:ring-[#006c55]/10 focus:bg-white'
              }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isCheckingUser ? (
              <Loader2 className="animate-spin text-slate-400" size={16} />
            ) : isUserAvailable === true ? (
              <Check className="text-[#006c55]" size={16} />
            ) : isUserAvailable === false ? (
              <AlertCircle className="text-red-500" size={16} />
            ) : null}
          </div>
        </div>
        {isUserAvailable === false && (
          <p className="text-[10px] text-red-500 font-bold ml-1">Este nome de usuário já está em uso.</p>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setStep(1)}
          className="w-14 h-14 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl flex items-center justify-center transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNextStep}
          disabled={!fullName || !username || !phoneNumber || isUserAvailable !== true}
          className="flex-1 h-14 bg-[#006c55] hover:bg-[#005a46] disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#006c55]/20 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Continuar <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Selecione sua Universidade</label>
        <div className="relative group">
          <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55] transition-colors" size={18} />
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white/50 border border-white/60 rounded-2xl text-[14px] font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] focus:bg-white transition-all appearance-none cursor-pointer"
          >
            {UNIVERSITIES.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <p className="text-[10px] text-[#006c55] font-bold ml-1 flex items-center gap-1">
          <AlertCircle size={10} />
          Atenção: Por enquanto operamos apenas na UERJ como projeto piloto.
        </p>
      </div>

      <div className="py-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input type="checkbox" required className="peer sr-only" />
            <div className="w-5 h-5 border-2 border-slate-200 rounded-lg bg-white peer-checked:bg-[#006c55] peer-checked:border-[#006c55] transition-all"></div>
            <ShieldCheck className="absolute inset-0 m-auto text-white scale-0 peer-checked:scale-100 transition-transform" size={12} strokeWidth={3} />
          </div>
          <span className="text-[11px] font-bold text-slate-500 leading-tight">Eu concordo com os Termos de Serviço e a Política de Privacidade.</span>
        </label>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setStep(2)}
          className="w-14 h-14 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl flex items-center justify-center transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleFinalSubmit}
          disabled={loading}
          className="flex-1 h-14 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#006c55]/20 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <>Finalizar Cadastro <Check size={18} /></>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] glass-panel rounded-[32px] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <div
            className="h-full bg-[#006c55] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="text-[40px] font-black text-[#006c55] tracking-tighter leading-none mb-2">thoth</div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">
            Etapa {step} de 3
          </p>
        </div>

        <div className="space-y-1 mb-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 && "Credenciais"}
            {step === 2 && "Identidade"}
            {step === 3 && "Instituição"}
          </h2>
          <p className="text-sm text-slate-500">
            {step === 1 && "Vamos começar com seu e-mail e senha."}
            {step === 2 && "Como você quer ser reconhecido?"}
            {step === 3 && "Onde você estuda ou leciona?"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <p className="text-red-600 text-[11px] font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        {/* Steps Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <p className="mt-8 text-center text-sm text-slate-500">
          Já possui uma conta?{' '}
          <Link to="/login" className="font-black text-[#006c55] hover:underline uppercase tracking-tighter text-xs">Entrar agora</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
