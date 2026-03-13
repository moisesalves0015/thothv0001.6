import React, { useState, useEffect } from 'react';
import {
    Printer,
    CloudUpload,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Download,
    Edit2,
    Save,
    X,
    HardDrive,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Copy,
    Share2,
    ExternalLink,
    Layout,
    Image,
    Type,
    Palette,
    Settings,
    Info,
    ChevronRight,
    Shield,
    Truck,
    CreditCard,
    Heart,
    Star,
    Award,
    Mail,
    Phone,
    MapPin,
    Globe,
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    Linkedin,
    MessageCircle,
    Zap,
    TrendingUp,
    Users,
    Package,
    Timer,
    Sparkles,
    PenTool,
    RefreshCw,
    XCircle,
    Scissors,
    Ruler,
    Droplets,
    Sun,
    Moon,
    Wind,
    Layers,
    Grid,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    RotateCw,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Star as StarIcon,
    Heart as HeartIcon,
    Bookmark,
    Flag,
    Camera,
    Video,
    Music,
    Headphones,
    Mic,
    Volume2,
    VolumeX,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Shuffle,
    Repeat,
    Bluetooth,
    Wifi,
    Battery,
    BatteryCharging,
    Signal,
    WifiOff,
    Airplay,
    Cast,
    Monitor,
    Smartphone,
    Tablet,
    Laptop,
    Watch,
    Gamepad2,
    Keyboard,
    Mouse,
    Speaker,
    Headset,
    Printer as PrinterIcon,
    Scan,
    Copy as CopyIcon,
    File,
    Folder,
    Archive,
    Database,
    Cloud,
    Server,
    Cpu,
    MemoryStick,
    HardDrive as HardDriveIcon,
    MonitorSmartphone,
    Sparkles as SparklesIcon
} from 'lucide-react';
import { collection, query, getDocs, updateDoc, deleteDoc, doc, orderBy, addDoc } from 'firebase/firestore';
import { ref, getMetadata, uploadBytes, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { PrintRequest } from '../../types';
import { toast } from 'sonner';
import { PrinterService } from '../../modules/print/printer.service';
import { motion, AnimatePresence } from 'framer-motion';

interface PrintOptions {
    copies: number;
    colorMode: 'color' | 'bw';
    doubleSided: boolean;
    pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
    paperType: 'standard' | 'premium' | 'photo' | 'recycled';
    binding: 'none' | 'stapled' | 'spiral' | 'hardcover' | 'softcover';
    orientation: 'portrait' | 'landscape';
    margins: 'normal' | 'narrow' | 'wide';
    scale: 'fit' | 'actual' | 'custom';
    customScale: number;
    quality: 'draft' | 'normal' | 'high' | 'photo';
    pagesPerSheet: 1 | 2 | 4;
    pageRange: string;
    finishing: {
        laminating: boolean;
        cutting: boolean;
        folding: boolean;
        perforation: boolean;
        scoring: boolean;
        embossing: boolean;
        foil: boolean;
        uv: boolean;
    };
}

interface PriceBreakdown {
    basePrice: number;
    copiesMultiplier: number;
    colorMultiplier: number;
    doubleSidedMultiplier: number;
    pageSizeMultiplier: number;
    paperTypeMultiplier: number;
    bindingPrice: number;
    finishingPrice: number;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
}

interface PrintPreview {
    pages: number;
    fileSize: number;
    dimensions: string;
    resolution: number;
    colorProfile: string;
}

const PrintShopPage: React.FC = () => {
    // State for orders
    const [orders, setOrders] = useState<PrintRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<PrintRequest | null>(null);

    // State for print options
    const [printOptions, setPrintOptions] = useState<PrintOptions>({
        copies: 1,
        colorMode: 'color',
        doubleSided: false,
        pageSize: 'A4',
        paperType: 'standard',
        binding: 'none',
        orientation: 'portrait',
        margins: 'normal',
        scale: 'fit',
        customScale: 100,
        quality: 'normal',
        pagesPerSheet: 1,
        pageRange: '',
        finishing: {
            laminating: false,
            cutting: false,
            folding: false,
            perforation: false,
            scoring: false,
            embossing: false,
            foil: false,
            uv: false
        }
    });

    // State for pricing
    const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>({
        basePrice: 0,
        copiesMultiplier: 1,
        colorMultiplier: 1,
        doubleSidedMultiplier: 1,
        pageSizeMultiplier: 1,
        paperTypeMultiplier: 1,
        bindingPrice: 0,
        finishingPrice: 0,
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0
    });

    // State for preview
    const [preview, setPreview] = useState<PrintPreview | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // State for UI
    const [activeTab, setActiveTab] = useState<'services' | 'orders' | 'profile' | 'reviews'>('services');
    const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // State for shop profile
    const [shopProfile, setShopProfile] = useState({
        name: 'Gráfica Digital Express',
        slogan: 'Impressão de qualidade com rapidez e precisão',
        description: 'Há mais de 10 anos oferecendo serviços de impressão de alta qualidade para empresas e clientes particulares. Tecnologia de ponta e materiais premium para resultados excepcionais.',
        logo: 'https://via.placeholder.com/150',
        coverImage: 'https://images.unsplash.com/photo-1562408592-8f9b2b2e7a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        rating: 4.8,
        reviews: 234,
        yearsInBusiness: 10,
        completedOrders: 15420,
        averageResponseTime: '15 min',
        address: 'Av. Paulista, 1000 - São Paulo, SP',
        phone: '(11) 99999-9999',
        email: 'contato@graficadigital.com.br',
        website: 'www.graficadigital.com.br',
        socialMedia: {
            instagram: '@graficadigital',
            facebook: '/graficadigital',
            twitter: '@graficadigital',
            youtube: '/c/graficadigital',
            linkedin: '/company/graficadigital'
        },
        workingHours: {
            monday: '08:00 - 18:00',
            tuesday: '08:00 - 18:00',
            wednesday: '08:00 - 18:00',
            thursday: '08:00 - 18:00',
            friday: '08:00 - 18:00',
            saturday: '09:00 - 13:00',
            sunday: 'Fechado'
        },
        paymentMethods: ['credit', 'debit', 'pix', 'boleto', 'cash'],
        deliveryOptions: ['pickup', 'delivery', 'express'],
        certifications: ['ISO 9001', 'FSC Certified', 'Carbon Neutral'],
        features: [
            'Impressão Digital',
            'Acabamento Profissional',
            'Entrega Rápida',
            'Materiais Premium',
            'Atendimento Personalizado',
            'Suporte Técnico'
        ]
    });

    // State for services
    const [services, setServices] = useState([
        {
            id: 'flyers',
            name: 'Flyers e Panfletos',
            description: 'Perfeito para divulgação de eventos, promoções e campanhas',
            basePrice: 0.50,
            image: 'https://images.unsplash.com/photo-1586075010923-6dd45739d1b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            icon: FileText,
            popular: true,
            specifications: [
                'Papel couchê brilho ou fosco',
                'Acabamento com corte preciso',
                'Cores vibrantes e nítidas',
                'Gramaturas: 90g a 300g'
            ],
            priceRules: {
                minCopies: 100,
                colorMultiplier: 1.2,
                doubleSidedMultiplier: 1.5,
                pageSizes: {
                    'A4': 1,
                    'A5': 0.6,
                    'A6': 0.4
                },
                paperTypes: {
                    'standard': 1,
                    'premium': 1.5,
                    'recycled': 1.2
                }
            }
        },
        {
            id: 'business-cards',
            name: 'Cartões de Visita',
            description: 'Cause uma ótima primeira impressão com cartões profissionais',
            basePrice: 0.20,
            image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            icon: CreditCard,
            popular: true,
            specifications: [
                'Papel couchê 300g',
                'Acabamento com laminação',
                'Corte preciso e cantos arredondados',
                'Versão simples ou frente e verso'
            ],
            priceRules: {
                minCopies: 50,
                colorMultiplier: 1.1,
                doubleSidedMultiplier: 1.3,
                paperTypes: {
                    'standard': 1,
                    'premium': 1.8,
                    'recycled': 1.3
                }
            }
        },
        {
            id: 'brochures',
            name: 'Brochuras e Catálogos',
            description: 'Materiais institucionais com acabamento profissional',
            basePrice: 15.00,
            image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            icon: Bookmark,
            popular: false,
            specifications: [
                'Capa em papel couchê 250g',
                'Miolo em papel offset 90g',
                'Acabamento com lombada',
                'Opções de grampeamento ou espiral'
            ],
            priceRules: {
                minCopies: 1,
                colorMultiplier: 1.3,
                pageSizes: {
                    'A4': 1,
                    'A5': 0.7
                },
                binding: {
                    'stapled': 2.50,
                    'spiral': 5.00,
                    'softcover': 10.00,
                    'hardcover': 25.00
                }
            }
        },
        {
            id: 'posters',
            name: 'Pôsteres e Banners',
            description: 'Comunique-se em grande escala com qualidade impressionante',
            basePrice: 25.00,
            image: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            icon: Maximize2,
            popular: false,
            specifications: [
                'Impressão em alta resolução',
                'Papel fotográfico ou lona',
                'Cores vivas e contrastantes',
                'Acabamento com ilhoses'
            ],
            priceRules: {
                minCopies: 1,
                pageSizes: {
                    'A2': 1,
                    'A1': 1.5,
                    'A0': 2
                },
                paperTypes: {
                    'standard': 1,
                    'premium': 1.8,
                    'photo': 2.2
                }
            }
        },
        {
            id: 'envelopes',
            name: 'Envelopes Personalizados',
            description: 'Comunique sua marca desde o primeiro contato',
            basePrice: 0.80,
            image: 'https://images.unsplash.com/photo-1586075010923-6dd45739d1b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            icon: Mail,
            popular: false,
            specifications: [
                'Papel offset 90g',
                'Impressão colorida',
                'Personalização com logotipo',
                'Vários tamanhos disponíveis'
            ],
            priceRules: {
                minCopies: 100,
                colorMultiplier: 1.2,
                pageSizes: {
                    'DL': 1,
                    'C5': 1.2,
                    'C4': 1.5
                }
            }
        },
        {
            id: 'folders',
            name: 'Pastas Personalizadas',
            description: 'Organização profissional para documentos e apresentações',
            basePrice: 5.00,
            image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            icon: Folder,
            popular: false,
            specifications: [
                'Papel couchê 300g',
                'Acabamento com laminação',
                'Bolso interno',
                'Personalização colorida'
            ],
            priceRules: {
                minCopies: 50,
                colorMultiplier: 1.3,
                finishing: {
                    'laminating': 2.00,
                    'folding': 1.00
                }
            }
        }
    ]);

    // State for selected service
    const [selectedService, setSelectedService] = useState<any | null>(null);

    // Load orders
    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'printRequests'),
                orderBy('timestamp', 'desc')
            );
            const snapshot = await getDocs(q);
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PrintRequest));
            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Erro ao carregar pedidos');
        } finally {
            setLoading(false);
        }
    };

    // Helper to extract page count from range string
    const calculatePagesToPrint = (rangeStr: string, totalPages: number): number => {
        if (!rangeStr.trim()) return totalPages;
        
        let count = 0;
        const parts = rangeStr.split(',').map(p => p.trim());
        
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= totalPages) {
                    count += (end - start + 1);
                }
            } else {
                const page = Number(part);
                if (!isNaN(page) && page >= 1 && page <= totalPages) {
                    count++;
                }
            }
        }
        
        return count > 0 ? count : totalPages;
    };

    // Recalculate price when options change
    useEffect(() => {
        if (selectedService && preview) {
            const pagesToPrint = calculatePagesToPrint(printOptions.pageRange, preview.pages);
            // Apply pages per sheet reduction
            const sheetCount = Math.ceil(pagesToPrint / printOptions.pagesPerSheet);
            calculatePrice(selectedService, printOptions, sheetCount);
        } else if (selectedService) {
            // Default 1 page for price preview without file
            calculatePrice(selectedService, printOptions, 1);
        }
    }, [printOptions, selectedService, preview]);

    // Calculate price based on options
    const calculatePrice = (service: any, options: PrintOptions, sheetCount: number = 1) => {
        const rules = service.priceRules;

        // Base price per unit
        let basePrice = service.basePrice;

        // Apply multipliers
        const copiesMultiplier = options.copies;
        const colorMultiplier = options.colorMode === 'color' ? (rules.colorMultiplier || 1) : 0.8;
        const doubleSidedMultiplier = options.doubleSided ? (rules.doubleSidedMultiplier || 1.5) : 1;
        const pageSizeMultiplier = rules.pageSizes?.[options.pageSize] || 1;
        const paperTypeMultiplier = rules.paperTypes?.[options.paperType] || 1;

        // Binding price
        let bindingPrice = 0;
        if (options.binding !== 'none' && rules.binding) {
            bindingPrice = rules.binding[options.binding] || 0;
        }

        // Finishing price
        let finishingPrice = 0;
        if (rules.finishing) {
            Object.entries(options.finishing).forEach(([key, value]) => {
                if (value && rules.finishing[key]) {
                    finishingPrice += rules.finishing[key];
                }
            });
        }

        // Calculate subtotal
        const subtotal = (basePrice * sheetCount * copiesMultiplier * colorMultiplier * doubleSidedMultiplier * pageSizeMultiplier * paperTypeMultiplier) + bindingPrice + finishingPrice;

        // Tax (10%)
        const tax = subtotal * 0.1;

        // Discount (if applicable)
        const discount = options.copies > 1000 ? subtotal * 0.15 :
            options.copies > 500 ? subtotal * 0.1 :
                options.copies > 100 ? subtotal * 0.05 : 0;

        // Total
        const total = subtotal + tax - discount;

        setPriceBreakdown({
            basePrice,
            copiesMultiplier,
            colorMultiplier,
            doubleSidedMultiplier,
            pageSizeMultiplier,
            paperTypeMultiplier,
            bindingPrice,
            finishingPrice,
            subtotal,
            tax,
            discount,
            total
        });
    };

    // Handle file upload
    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress(i);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setPreviewFile(file);

            // Get file info
            const fileInfo: PrintPreview = {
                pages: Math.ceil(file.size / 1024 / 50), // Simulated page count
                fileSize: file.size,
                dimensions: '210mm x 297mm', // A4 default
                resolution: 300, // dpi
                colorProfile: 'CMYK'
            };
            setPreview(fileInfo);

            toast.success('Arquivo carregado com sucesso!');
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Erro ao carregar arquivo');
        } finally {
            setIsUploading(false);
        }
    };

    // Submit order
    const submitOrder = async () => {
        if (!selectedService || !previewFile) {
            toast.error('Selecione um serviço e faça upload do arquivo');
            return;
        }

        try {
            const orderData = {
                ...selectedService,
                ...printOptions,
                priceBreakdown,
                timestamp: Date.now(),
                status: 'pending',
                archived: false
            };

            await addDoc(collection(db, 'printRequests'), orderData);
            toast.success('Pedido enviado com sucesso!');
            setShowFileUpload(false);
            setSelectedService(null);
            setPreviewFile(null);
            setPreviewUrl(null);
            setPrintOptions({
                copies: 1,
                colorMode: 'color',
                doubleSided: false,
                pageSize: 'A4',
                paperType: 'standard',
                binding: 'none',
                orientation: 'portrait',
                margins: 'normal',
                scale: 'fit',
                customScale: 100,
                quality: 'normal',
                finishing: {
                    laminating: false,
                    cutting: false,
                    folding: false,
                    perforation: false,
                    scoring: false,
                    embossing: false,
                    foil: false,
                    uv: false
                }
            });
        } catch (error) {
            console.error('Error submitting order:', error);
            toast.error('Erro ao enviar pedido');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Cover Image */}
            <div className="relative h-96 overflow-hidden">
                <img
                    src={shopProfile.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Shop Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                            <div className="relative z-10">
                                <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-2xl">
                                    <img
                                        src={shopProfile.logo}
                                        alt={shopProfile.name}
                                        className="w-full h-full rounded-xl object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2">
                                    <CheckCircle2 size={20} className="text-white" />
                                </div>
                            </div>

                            <div className="flex-1 pb-4 w-full md:w-auto text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                    <h1 className="text-3xl md:text-4xl font-black">{shopProfile.name}</h1>
                                    <div className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur rounded-full">
                                        <Star className="text-yellow-400 fill-yellow-400" size={16} />
                                        <span className="text-sm font-bold">{shopProfile.rating}</span>
                                        <span className="text-sm text-white/60">({shopProfile.reviews})</span>
                                    </div>
                                </div>

                                <p className="text-xl text-white/90 mb-3">{shopProfile.slogan}</p>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/80">
                                    <div className="flex items-center gap-1">
                                        <Award size={16} />
                                        <span>{shopProfile.yearsInBusiness} anos</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Package size={16} />
                                        <span>{shopProfile.completedOrders.toLocaleString()} pedidos</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Timer size={16} />
                                        <span>Resposta {shopProfile.averageResponseTime}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 pb-4 w-full md:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                                >
                                    <Heart size={20} />
                                    Seguir
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                >
                                    <MessageCircle size={20} />
                                    Contato
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-700 pb-4">
                    {[
                        { id: 'services', label: 'Serviços', icon: Printer },
                        { id: 'orders', label: 'Meus Pedidos', icon: Package },
                        { id: 'profile', label: 'Sobre a Gráfica', icon: Info },
                        { id: 'reviews', label: 'Avaliações', icon: Star }
                    ].map(tab => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </motion.button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <motion.div
                            key="services"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Service Categories */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service, index) => {
                                    const Icon = service.icon;
                                    return (
                                        <motion.div
                                            key={service.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -5 }}
                                            onClick={() => {
                                                setSelectedService(service);
                                                setShowFileUpload(true);
                                            }}
                                            className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={service.image}
                                                    alt={service.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                                {service.popular && (
                                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                        <Zap size={12} />
                                                        MAIS POPULAR
                                                    </div>
                                                )}

                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <div className="flex items-center gap-3 text-white">
                                                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                                            <Icon size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold">{service.name}</h3>
                                                            <p className="text-sm text-white/80">A partir de R$ {service.basePrice.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6">
                                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                                                    {service.description}
                                                </p>

                                                <div className="space-y-2">
                                                    {service.specifications.slice(0, 3).map((spec, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                                            {spec}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-400">Quantidade mínima</span>
                                                    <span className="text-lg font-black text-emerald-500">{service.priceRules.minCopies}+</span>
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* File Upload Modal */}
                            <AnimatePresence>
                                {showFileUpload && selectedService && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                        onClick={() => setShowFileUpload(false)}
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, y: 20 }}
                                            animate={{ scale: 1, y: 0 }}
                                            exit={{ scale: 0.9, y: 20 }}
                                            className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                                                            <selectedService.icon size={32} className="text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-2xl font-black">{selectedService.name}</h2>
                                                            <p className="text-sm text-slate-500">{selectedService.description}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowFileUpload(false)}
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-6 space-y-6">
                                                {/* File Upload Area */}
                                                {!previewFile ? (
                                                    <motion.div
                                                        whileHover={{ scale: 1.02 }}
                                                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer"
                                                        onClick={() => document.getElementById('file-upload')?.click()}
                                                    >
                                                        <input
                                                            id="file-upload"
                                                            type="file"
                                                            accept=".pdf,.jpg,.jpeg,.png,.ai,.eps,.psd"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleFileUpload(file);
                                                            }}
                                                        />

                                                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <CloudUpload size={32} className="text-emerald-500" />
                                                        </div>

                                                        <h3 className="text-lg font-bold mb-2">
                                                            Clique para fazer upload do arquivo
                                                        </h3>

                                                        <p className="text-sm text-slate-500 mb-4">
                                                            Arraste e solte ou clique para selecionar
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            Formatos aceitos: PDF, JPG, PNG, AI, EPS, PSD (máx. 100MB)
                                                        </p>
                                                    </motion.div>
                                                ) : (
                                                    <>
                                                        {/* File Preview */}
                                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                                                        <FileText size={24} className="text-emerald-500" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold">{previewFile.name}</h4>
                                                                        <p className="text-xs text-slate-500">
                                                                            {(previewFile.size / 1024 / 1024).toFixed(2)} MB • {preview?.pages} páginas
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        setPreviewFile(null);
                                                                        setPreviewUrl(null);
                                                                        setPreview(null);
                                                                    }}
                                                                    className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>

                                                            {/* Preview Image / PDF */}
                                                            {previewUrl && (
                                                                <div className="relative aspect-[3/4] bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                                                    {printOptions.pagesPerSheet > 1 ? (
                                                                        <div className={`absolute inset-0 p-2 grid gap-2 bg-slate-100 dark:bg-slate-800 ${printOptions.pagesPerSheet === 2 ? 'grid-rows-2' : 'grid-cols-2 grid-rows-2'}`}>
                                                                            {Array.from({ length: printOptions.pagesPerSheet }).map((_, i) => (
                                                                                <div key={i} className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 overflow-hidden relative shadow-sm">
                                                                                    {/* Block interaction for grid view to prevent scrolling individual panes unnecessarily */}
                                                                                    <div className="absolute inset-0 z-10 pointer-events-none" />
                                                                                    {previewFile?.type === 'application/pdf' ? (
                                                                                        <iframe
                                                                                            src={`${previewUrl}#page=${i + 1}&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                                                                                            className="w-full h-full border-0 pointer-events-none"
                                                                                            title={`PDF Preview ${i + 1}`}
                                                                                        />
                                                                                    ) : (
                                                                                        <img
                                                                                            src={previewUrl}
                                                                                            alt={`Preview ${i + 1}`}
                                                                                            className="w-full h-full object-contain"
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        previewFile?.type === 'application/pdf' ? (
                                                                            <iframe
                                                                                src={`${previewUrl}#toolbar=0`}
                                                                                className="w-full h-full border-0"
                                                                                title="PDF Preview"
                                                                            />
                                                                        ) : (
                                                                            <img
                                                                                src={previewUrl}
                                                                                alt="Preview"
                                                                                className="w-full h-full object-contain"
                                                                            />
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Print Options */}
                                                        <div className="space-y-4">
                                                            <h3 className="text-lg font-black flex items-center gap-2">
                                                                <Settings size={20} className="text-emerald-500" />
                                                                Opções de Impressão
                                                            </h3>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {/* Copies */}
                                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                                                                        Quantidade de Cópias
                                                                    </label>
                                                                    <div className="flex items-center gap-3">
                                                                        <button
                                                                            onClick={() => setPrintOptions({
                                                                                ...printOptions,
                                                                                copies: Math.max(1, printOptions.copies - 1)
                                                                            })}
                                                                            className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                                                        >
                                                                            <Minus size={16} />
                                                                        </button>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            value={printOptions.copies}
                                                                            onChange={(e) => setPrintOptions({
                                                                                ...printOptions,
                                                                                copies: parseInt(e.target.value) || 1
                                                                            })}
                                                                            className="w-20 text-center bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-bold"
                                                                        />
                                                                        <button
                                                                            onClick={() => setPrintOptions({
                                                                                ...printOptions,
                                                                                copies: printOptions.copies + 1
                                                                            })}
                                                                            className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                                                        >
                                                                            <Plus size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Page Range Filter */}
                                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                                                                        Páginas a Imprimir
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Ex: 1-5, 8, 11-13"
                                                                        value={printOptions.pageRange}
                                                                        onChange={(e) => setPrintOptions({
                                                                            ...printOptions,
                                                                            pageRange: e.target.value
                                                                        })}
                                                                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                                    />
                                                                    <p className="text-[10px] text-slate-500 mt-1">Deixe em branco para tudo</p>
                                                                </div>

                                                                {/* Pages Per Sheet */}
                                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                                                                        Páginas por Folha
                                                                    </label>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {[1, 2, 4].map(num => (
                                                                            <button
                                                                                key={num}
                                                                                onClick={() => setPrintOptions({
                                                                                    ...printOptions,
                                                                                    pagesPerSheet: num as any
                                                                                })}
                                                                                className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${printOptions.pagesPerSheet === num
                                                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                                                        : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                                                    }`}
                                                                            >
                                                                                {num}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Color Mode */}
                                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                                                                        Modo de Cor
                                                                    </label>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <button
                                                                            onClick={() => setPrintOptions({
                                                                                ...printOptions,
                                                                                colorMode: 'color'
                                                                            })}
                                                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${printOptions.colorMode === 'color'
                                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                                                    : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                                                }`}
                                                                        >
                                                                            Colorido
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setPrintOptions({
                                                                                ...printOptions,
                                                                                colorMode: 'bw'
                                                                            })}
                                                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${printOptions.colorMode === 'bw'
                                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                                                    : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                                                }`}
                                                                        >
                                                                            P&B
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Double Sided */}
                                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                                                                        Impressão
                                                                    </label>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <button
                                                                            onClick={() => setPrintOptions({
                                                                                ...printOptions,
                                                                                doubleSided: false
                                                                            })}
                                                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${!printOptions.doubleSided
                                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                                                    : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                                                }`}
                                                                        >
                                                                            Simples
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setPrintOptions({
                                                                                ...printOptions,
                                                                                doubleSided: true
                                                                            })}
                                                                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${printOptions.doubleSided
                                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                                                    : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                                                }`}
                                                                        >
                                                                            Frente e Verso
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Page Size */}
                                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                                                                        Tamanho do Papel
                                                                    </label>
                                                                    <select
                                                                        value={printOptions.pageSize}
                                                                        onChange={(e) => setPrintOptions({
                                                                            ...printOptions,
                                                                            pageSize: e.target.value as any
                                                                        })}
                                                                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-sm font-bold"
                                                                    >
                                                                        <option value="A4">A4 (210 x 297 mm)</option>
                                                                        <option value="A3">A3 (297 x 420 mm)</option>
                                                                        <option value="Letter">Carta (216 x 279 mm)</option>
                                                                        <option value="Legal">Ofício (216 x 356 mm)</option>
                                                                    </select>
                                                                </div>

                                                                {/* Paper Type */}
                                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                                                                        Tipo de Papel
                                                                    </label>
                                                                    <select
                                                                        value={printOptions.paperType}
                                                                        onChange={(e) => setPrintOptions({
                                                                            ...printOptions,
                                                                            paperType: e.target.value as any
                                                                        })}
                                                                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-sm font-bold"
                                                                    >
                                                                        <option value="standard">Standard</option>
                                                                        <option value="premium">Premium</option>
                                                                        <option value="photo">Fotográfico</option>
                                                                        <option value="recycled">Reciclado</option>
                                                                    </select>
                                                                </div>

                                                                {/* Quality */}
                                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                                                                        Qualidade
                                                                    </label>
                                                                    <select
                                                                        value={printOptions.quality}
                                                                        onChange={(e) => setPrintOptions({
                                                                            ...printOptions,
                                                                            quality: e.target.value as any
                                                                        })}
                                                                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-sm font-bold"
                                                                    >
                                                                        <option value="draft">Rascunho</option>
                                                                        <option value="normal">Normal</option>
                                                                        <option value="high">Alta</option>
                                                                        <option value="photo">Foto</option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            {/* Finishing Options */}
                                                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">
                                                                    Acabamentos Adicionais
                                                                </label>
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                    {Object.entries(printOptions.finishing).map(([key, value]) => (
                                                                        <button
                                                                            key={key}
                                                                            onClick={() => setPrintOptions({
                                                                                ...printOptions,
                                                                                finishing: {
                                                                                    ...printOptions.finishing,
                                                                                    [key]: !value
                                                                                }
                                                                            })}
                                                                            className={`px-3 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${value
                                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                                                    : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                                                }`}
                                                                        >
                                                                            {key === 'laminating' && <span>Laminação</span>}
                                                                            {key === 'cutting' && <span>Corte</span>}
                                                                            {key === 'folding' && <span>Dobra</span>}
                                                                            {key === 'perforation' && <span>Perfuração</span>}
                                                                            {key === 'scoring' && <span>Vincagem</span>}
                                                                            {key === 'embossing' && <span>Relevo</span>}
                                                                            {key === 'foil' && <span>Foil</span>}
                                                                            {key === 'uv' && <span>UV</span>}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Binding Options */}
                                                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">
                                                                    Tipo de Encadernação
                                                                </label>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                    {[
                                                                        { value: 'none', label: 'Sem encadernação' },
                                                                        { value: 'stapled', label: 'Grampeado' },
                                                                        { value: 'spiral', label: 'Espiral' },
                                                                        { value: 'softcover', label: 'Capa Mole' },
                                                                        { value: 'hardcover', label: 'Capa Dura' }
                                                                    ].map(option => (
                                                                        <button
                                                                            key={option.value}
                                                                            onClick={() => setPrintOptions({
                                                                                ...printOptions,
                                                                                binding: option.value as any
                                                                            })}
                                                                            className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${printOptions.binding === option.value
                                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                                                                    : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                                                }`}
                                                                        >
                                                                            {option.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Price Breakdown */}
                                                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4">
                                                            <button
                                                                onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                                                                className="w-full flex items-center justify-between mb-3"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <ShoppingCart size={18} className="text-emerald-500" />
                                                                    <span className="font-bold">Detalhamento de Preços</span>
                                                                </div>
                                                                <ChevronRight size={18} className={`transform transition-transform ${showPriceBreakdown ? 'rotate-90' : ''}`} />
                                                            </button>

                                                            <AnimatePresence>
                                                                {showPriceBreakdown && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="space-y-2 text-sm">
                                                                            <div className="flex justify-between">
                                                                                <span className="text-slate-500">Preço base</span>
                                                                                <span className="font-mono">R$ {priceBreakdown.basePrice.toFixed(2)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-slate-500">Multiplicador cópias</span>
                                                                                <span className="font-mono">x{priceBreakdown.copiesMultiplier}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-slate-500">Multiplicador cor</span>
                                                                                <span className="font-mono">x{priceBreakdown.colorMultiplier.toFixed(2)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-slate-500">Multiplicador frente/verso</span>
                                                                                <span className="font-mono">x{priceBreakdown.doubleSidedMultiplier.toFixed(2)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-slate-500">Multiplicador tamanho</span>
                                                                                <span className="font-mono">x{priceBreakdown.pageSizeMultiplier.toFixed(2)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-slate-500">Multiplicador papel</span>
                                                                                <span className="font-mono">x{priceBreakdown.paperTypeMultiplier.toFixed(2)}</span>
                                                                            </div>
                                                                            {priceBreakdown.bindingPrice > 0 && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-slate-500">Encadernação</span>
                                                                                    <span className="font-mono">R$ {priceBreakdown.bindingPrice.toFixed(2)}</span>
                                                                                </div>
                                                                            )}
                                                                            {priceBreakdown.finishingPrice > 0 && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-slate-500">Acabamentos</span>
                                                                                    <span className="font-mono">R$ {priceBreakdown.finishingPrice.toFixed(2)}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="pt-2 border-t border-slate-300 dark:border-slate-700">
                                                                                <div className="flex justify-between font-bold">
                                                                                    <span>Subtotal</span>
                                                                                    <span>R$ {priceBreakdown.subtotal.toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex justify-between text-emerald-500">
                                                                                <span>Desconto</span>
                                                                                <span>- R$ {priceBreakdown.discount.toFixed(2)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between text-slate-500">
                                                                                <span>Impostos</span>
                                                                                <span>R$ {priceBreakdown.tax.toFixed(2)}</span>
                                                                            </div>
                                                                            <div className="pt-2 border-t border-slate-300 dark:border-slate-700">
                                                                                <div className="flex justify-between text-lg font-black">
                                                                                    <span>Total</span>
                                                                                    <span className="text-emerald-500">R$ {priceBreakdown.total.toFixed(2)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm text-slate-500 block">Total estimado</span>
                                                        <span className="text-3xl font-black text-emerald-500">
                                                            R$ {priceBreakdown.total.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setShowFileUpload(false)}
                                                            className="px-6 py-3 border border-slate-300 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        >
                                                            Cancelar
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={submitOrder}
                                                            disabled={!previewFile}
                                                            className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                        >
                                                            <ShoppingCart size={20} />
                                                            Finalizar Pedido
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <motion.div
                            key="orders"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black">Meus Pedidos</h2>
                                <button
                                    onClick={loadOrders}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                >
                                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                    Atualizar
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <RefreshCw size={32} className="animate-spin text-emerald-500 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500">Carregando pedidos...</p>
                                    </div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Package size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">Nenhum pedido ainda</h3>
                                    <p className="text-sm text-slate-500 mb-6">Comece fazendo seu primeiro pedido de impressão</p>
                                    <button
                                        onClick={() => setActiveTab('services')}
                                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors inline-flex items-center gap-2"
                                    >
                                        <Printer size={16} />
                                        Ver serviços
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order, index) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${order.status === 'ready' ? 'bg-emerald-100 text-emerald-600' :
                                                            order.status === 'printing' ? 'bg-blue-100 text-blue-600' :
                                                                order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                                    'bg-amber-100 text-amber-600'
                                                        }`}>
                                                        {order.status === 'ready' && <CheckCircle2 size={24} />}
                                                        {order.status === 'printing' && <RefreshCw size={24} className="animate-spin" />}
                                                        {order.status === 'cancelled' && <XCircle size={24} />}
                                                        {order.status === 'pending' && <Clock size={24} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="font-bold">{order.fileName}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                                                                    order.status === 'printing' ? 'bg-blue-100 text-blue-700' :
                                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                            'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {order.status === 'ready' && 'Pronto'}
                                                                {order.status === 'printing' && 'Imprimindo'}
                                                                {order.status === 'cancelled' && 'Cancelado'}
                                                                {order.status === 'pending' && 'Pendente'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 mb-2">
                                                            Pedido #{order.id.slice(0, 8)} • {new Date(order.timestamp).toLocaleDateString('pt-BR')}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs">
                                                            <span className="text-slate-400">Cópias: {order.copies || 1}</span>
                                                            <span className="text-slate-400">Páginas: {order.pages || 1}</span>
                                                            <span className="text-slate-400">Total: <span className="font-black text-emerald-500">R$ {order.totalPrice?.toFixed(2)}</span></span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    Detalhes
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* About */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Info size={20} className="text-emerald-500" />
                                    Sobre a Gráfica
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                    {shopProfile.description}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                            <Award size={20} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Certificações</h4>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {shopProfile.certifications.map((cert, i) => (
                                                    <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                                                        {cert}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                            <Zap size={20} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Diferenciais</h4>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {shopProfile.features.map((feature, i) => (
                                                    <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Mail size={20} className="text-emerald-500" />
                                    Informações de Contato
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                            <MapPin size={20} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Endereço</p>
                                            <p className="font-bold text-sm">{shopProfile.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                            <Phone size={20} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Telefone</p>
                                            <p className="font-bold text-sm">{shopProfile.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                            <Mail size={20} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">E-mail</p>
                                            <p className="font-bold text-sm">{shopProfile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                            <Globe size={20} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Website</p>
                                            <p className="font-bold text-sm">{shopProfile.website}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-emerald-500" />
                                    Horário de Funcionamento
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(shopProfile.workingHours).map(([day, hours]) => (
                                        <div key={day} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                            <span className="font-bold text-sm capitalize">
                                                {day === 'monday' && 'Segunda-feira'}
                                                {day === 'tuesday' && 'Terça-feira'}
                                                {day === 'wednesday' && 'Quarta-feira'}
                                                {day === 'thursday' && 'Quinta-feira'}
                                                {day === 'friday' && 'Sexta-feira'}
                                                {day === 'saturday' && 'Sábado'}
                                                {day === 'sunday' && 'Domingo'}
                                            </span>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Instagram size={20} className="text-emerald-500" />
                                    Redes Sociais
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    <a href="#" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        <Instagram size={18} className="text-pink-500" />
                                        <span className="text-sm font-bold">{shopProfile.socialMedia.instagram}</span>
                                    </a>
                                    <a href="#" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        <Facebook size={18} className="text-blue-500" />
                                        <span className="text-sm font-bold">{shopProfile.socialMedia.facebook}</span>
                                    </a>
                                    <a href="#" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        <Twitter size={18} className="text-sky-500" />
                                        <span className="text-sm font-bold">{shopProfile.socialMedia.twitter}</span>
                                    </a>
                                    <a href="#" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        <Youtube size={18} className="text-red-500" />
                                        <span className="text-sm font-bold">{shopProfile.socialMedia.youtube}</span>
                                    </a>
                                    <a href="#" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        <Linkedin size={18} className="text-blue-700" />
                                        <span className="text-sm font-bold">{shopProfile.socialMedia.linkedin}</span>
                                    </a>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <CreditCard size={20} className="text-emerald-500" />
                                    Formas de Pagamento
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {shopProfile.paymentMethods.includes('credit') && (
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold">
                                            Cartão de Crédito
                                        </div>
                                    )}
                                    {shopProfile.paymentMethods.includes('debit') && (
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold">
                                            Cartão de Débito
                                        </div>
                                    )}
                                    {shopProfile.paymentMethods.includes('pix') && (
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold text-emerald-500">
                                            PIX
                                        </div>
                                    )}
                                    {shopProfile.paymentMethods.includes('boleto') && (
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold">
                                            Boleto Bancário
                                        </div>
                                    )}
                                    {shopProfile.paymentMethods.includes('cash') && (
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold">
                                            Dinheiro
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Delivery Options */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Truck size={20} className="text-emerald-500" />
                                    Opções de Entrega
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {shopProfile.deliveryOptions.includes('pickup') && (
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold">
                                            Retirada no Local
                                        </div>
                                    )}
                                    {shopProfile.deliveryOptions.includes('delivery') && (
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold">
                                            Entrega
                                        </div>
                                    )}
                                    {shopProfile.deliveryOptions.includes('express') && (
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold text-amber-500">
                                            Expressa (24h)
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <motion.div
                            key="reviews"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Rating Summary */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-5xl font-black text-emerald-500">{shopProfile.rating}</div>
                                        <div className="flex items-center gap-1 mt-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <StarIcon key={star} size={16} className={`${star <= Math.floor(shopProfile.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{shopProfile.reviews} avaliações</p>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {[5, 4, 3, 2, 1].map(rating => (
                                            <div key={rating} className="flex items-center gap-2">
                                                <span className="text-xs font-bold w-8">{rating} estrelas</span>
                                                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${Math.random() * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-500 w-12">{Math.floor(Math.random() * 100)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-black">
                                                    JD
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">João da Silva</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <StarIcon key={star} size={12} className={star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-slate-500">Há 2 dias</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                                                Pedido #ABC123
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            Excelente serviço! A qualidade da impressão ficou perfeita e a entrega foi super rápida. Recomendo muito!
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PrintShopPage;