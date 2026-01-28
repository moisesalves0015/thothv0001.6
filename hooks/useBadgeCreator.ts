import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { BadgeService } from '../modules/badges/badge.service';
import { jsPDF } from 'jspdf';

export const useBadgeCreator = () => {
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFirstBadge, setIsFirstBadge] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Acadêmico');
    const [visibility, setVisibility] = useState('Público');
    const [imageUrl, setImageUrl] = useState('');
    const [width, setWidth] = useState(1);
    const [height, setHeight] = useState(1);

    // Payment State
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [cpf, setCpf] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const isAdmin = userProfile?.role === 'Admin';

    // Image Adjustment State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const checkHistory = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, 'badges'), where('creatorId', '==', user.uid));
                const snap = await getDocs(q);
                setIsFirstBadge(snap.empty);
            } catch (e) { console.error(e); }
        };
        checkHistory();
    }, [user]);

    const basePrice = 4.90;
    const platformFee = 1.50;
    const subtotal = useMemo(() => (width * height * basePrice), [width, height]);

    // Pricing Logic: Free if Admin OR First Badge
    const isFree = isAdmin || isFirstBadge;
    const totalPrice = useMemo(() => isFree ? 0 : subtotal + platformFee, [subtotal, platformFee, isFree]);

    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0, ratio: 1 });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImageUrl(result);

                // Calculate dimensions
                const img = new Image();
                img.onload = () => {
                    setImgDimensions({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        ratio: img.naturalWidth / img.naturalHeight
                    });
                };
                img.src = result;

                // Reset adjustment on new image
                setScale(1);
                setPosition({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
    };

    const getCroppedImage = async () => {
        if (!imageUrl) return imageUrl;

        return new Promise<string>((resolve) => {
            const img = new Image();
            img.src = imageUrl;
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // High resolution output
                const baseSize = 300;
                canvas.width = width * baseSize;
                canvas.height = height * baseSize;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(imageUrl);
                    return;
                }

                // 1. Calculate CSS Visual Reference Values (must match JSX logic exactly)
                // The Preview Mask Size in CSS (max 260px)
                const maskCSSWidth = Math.min(width * 100, 260);
                const maskCSSHeight = Math.min(height * 100, 260);

                // The Scale Factor between CSS Pixels and Canvas Pixels
                const k = canvas.width / maskCSSWidth;

                // 2. Calculate Wrapper Size (The image container size in CSS)
                const maskRatio = maskCSSWidth / maskCSSHeight;
                const imgRatio = imgDimensions.ratio || (img.width / img.height);

                let wrapperCSSWidth, wrapperCSSHeight;

                if (imgRatio > maskRatio) {
                    // Image is wider -> Height fixed to Mask
                    wrapperCSSHeight = maskCSSHeight;
                    wrapperCSSWidth = maskCSSHeight * imgRatio;
                } else {
                    // Image is taller -> Width fixed to Mask
                    wrapperCSSWidth = maskCSSWidth;
                    wrapperCSSHeight = maskCSSWidth / imgRatio;
                }

                // 3. Draw on Canvas
                ctx.save();

                // Start at Center of Canvas
                ctx.translate(canvas.width / 2, canvas.height / 2);

                // Apply User Translations (converted from CSS pixels to Canvas pixels)
                ctx.translate(position.x * k, position.y * k);

                // Apply User Scale
                ctx.scale(scale, scale);

                // Draw Image Centered
                // Dimensions must be the Wrapper Size scaled up by K
                const drawW = wrapperCSSWidth * k;
                const drawH = wrapperCSSHeight * k;

                ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

                ctx.restore();

                resolve(canvas.toDataURL('image/webp', 0.9));
            };
            img.onerror = () => resolve(imageUrl);
        });
    };

    const submitBadge = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const finalImage = await getCroppedImage();

            // Update state to show the final cropped version in the Success screen
            setImageUrl(finalImage);

            await BadgeService.createBadge({
                name: name.trim(),
                description: description.trim(),
                category,
                visibility,
                imageUrl: finalImage,
                width,
                height,
                x: 0,
                y: 0,
                creatorId: user?.uid || 'anonymous',
                totalPaid: totalPrice,
                paymentInfo: isAdmin ? 'Admin Grant' : (isFirstBadge ? 'First Badge Free' : 'Credit Card')
            });
            setIsSuccess(true);
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar emblema.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadReceipt = () => {
        const doc = new jsPDF();
        const transId = Math.random().toString(36).substring(2, 15).toUpperCase();
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();

        // Estilização do PDF
        doc.setFillColor(0, 108, 85); // Thoth Primary
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("CERTIFICADO DE ATIVO DIGITAL", 105, 25, { align: 'center' });

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.text(`ID DA TRANSACAO: ${transId}`, 20, 50);
        doc.text(`DATA: ${date} AS ${time}`, 20, 55);
        doc.text(`STATUS: ${totalPrice === 0 ? 'GRATUITO' : 'PAGO'}`, 20, 60);

        doc.setDrawColor(0, 108, 85);
        doc.setLineWidth(1);
        doc.line(20, 65, 190, 65);

        doc.setFontSize(16);
        doc.text("DETALHES DO EMBLEMA", 20, 80);
        doc.setFontSize(12);
        doc.text(`NOME: ${name}`, 20, 95);
        doc.text(`CATEGORIA: ${category}`, 20, 105);
        doc.text(`VISIBILIDADE: ${visibility}`, 20, 115);
        doc.text(`DIMENSOES NO MURAL: ${width}x${height} BLOCOS`, 20, 125);
        doc.text(`PROPRIETARIO: ${user?.displayName || 'USUARIO THOTH'}`, 20, 135);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        const footerText = "Este documento comprova a posse e o registro do ativo digital no Mural Thoth Creative Suite. O ativo e vitalicio e irrevogavel dentro das normas da plataforma.";
        doc.text(doc.splitTextToSize(footerText, 170), 20, 260);

        doc.save(`thoth-cert-${name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    };

    return {
        navigate,
        fileInputRef,
        step,
        setStep,
        isProcessing,
        isSuccess,
        isFirstBadge,
        isAdmin,
        name, setName,
        description, setDescription,
        category, setCategory,
        visibility, setVisibility,
        imageUrl, setImageUrl,
        width, setWidth,
        height, setHeight,
        cardNumber, setCardNumber,
        cardHolder, setCardHolder,
        cpf, setCpf,
        expiry, setExpiry,
        cvv, setCvv,
        subtotal,
        platformFee,
        totalPrice,
        isFree,
        isFree,
        scale, setScale,
        position, setPosition,
        imgDimensions,
        isDraggingImage, setIsDraggingImage,
        dragStart,
        handleImageUpload,
        submitBadge,
        downloadReceipt
    };
};
