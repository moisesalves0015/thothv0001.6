import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { BadgeService } from '../modules/badges/badge.service';
import { jsPDF } from 'jspdf';
import { getCroppedImg } from '../utils/canvasUtils';

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

    // Crop State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImageUrl(result);
                // Reset crop state
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const submitBadge = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const finalImage = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);

            if (!finalImage) throw new Error('Failed to crop image');

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
        crop, setCrop,
        zoom, setZoom,
        rotation, setRotation,
        onCropComplete,
        handleImageUpload,
        submitBadge,
        downloadReceipt
    };
};
