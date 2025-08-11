import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface FontSizeControlProps {
    onFontSizeChange?: (size: number) => void;
    initialSize?: number;
    minSize?: number;
    maxSize?: number;
    step?: number;
}

const FontSizeControl: React.FC<FontSizeControlProps> = ({
    onFontSizeChange,
    initialSize = 16,
    minSize = 12,
    maxSize = 24,
    step = 2
}) => {
    const [fontSize, setFontSize] = useState(initialSize);

    // استرجاع حجم الخط المحفوظ من localStorage عند التحميل
    useEffect(() => {
        const savedFontSize = localStorage.getItem('article-font-size');
        if (savedFontSize) {
            const size = parseInt(savedFontSize);
            if (size >= minSize && size <= maxSize) {
                setFontSize(size);
                onFontSizeChange?.(size);
            }
        } else {
            // إذا لم يكن هناك حجم محفوظ، استخدم الحجم الافتراضي
            onFontSizeChange?.(initialSize);
        }
    }, []); // إزالة onFontSizeChange من التبعيات

    const increaseFontSize = () => {
        const newSize = Math.min(fontSize + step, maxSize);
        console.log('Increasing font size to:', newSize);
        setFontSize(newSize);
        localStorage.setItem('article-font-size', newSize.toString());
        onFontSizeChange?.(newSize);
    };

    const decreaseFontSize = () => {
        const newSize = Math.max(fontSize - step, minSize);
        console.log('Decreasing font size to:', newSize);
        setFontSize(newSize);
        localStorage.setItem('article-font-size', newSize.toString());
        onFontSizeChange?.(newSize);
    };

    return (
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
            <Button
                variant="ghost"
                size="sm"
                onClick={decreaseFontSize}
                disabled={fontSize <= minSize}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="تصغير الخط"
            >
                <Minus className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center px-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">الخط</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {fontSize}
                </span>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={increaseFontSize}
                disabled={fontSize >= maxSize}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title="تكبير الخط"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default FontSizeControl;
