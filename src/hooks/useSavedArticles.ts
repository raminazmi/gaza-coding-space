import { useState, useEffect } from 'react';

interface SavedArticle {
    id: string;
    name: string;
    image: string;
    small_description?: string;
    created_by?: string;
    created_at?: string;
    savedAt: number;
}

export const useSavedArticles = () => {
    const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

    useEffect(() => {
        loadSavedArticles();
    }, []);

    const loadSavedArticles = () => {
        try {
            const saved = localStorage.getItem('savedArticles');
            if (saved) {
                const articles = JSON.parse(saved);
                setSavedArticles(articles);
            }
        } catch (error) {
            console.error('Error loading saved articles:', error);
            setSavedArticles([]);
        }
    };

    const saveArticle = (article: any) => {
        try {
            const savedArticle: SavedArticle = {
                id: String(article.id),
                name: article.name,
                image: article.image,
                small_description: article.small_description,
                created_by: article.created_by,
                created_at: article.created_at,
                savedAt: Date.now()
            };

            // قراءة البيانات الحالية من localStorage
            const currentSaved = localStorage.getItem('savedArticles');
            const currentArticles = currentSaved ? JSON.parse(currentSaved) : [];

            const isAlreadySaved = currentArticles.some((a: SavedArticle) => String(a.id) === String(savedArticle.id));

            if (!isAlreadySaved) {
                const updatedArticles = [savedArticle, ...currentArticles];

                // حفظ في localStorage
                localStorage.setItem('savedArticles', JSON.stringify(updatedArticles));

                // تحديث الحالة
                setSavedArticles(updatedArticles);

                console.log('Article saved to localStorage:', savedArticle.id);
                return true; // تم الحفظ بنجاح
            }
            return false; // المقال محفوظ مسبقاً
        } catch (error) {
            console.error('Error saving article:', error);
            return false;
        }
    };

    const removeArticle = (articleId: string) => {
        try {
            // قراءة البيانات الحالية من localStorage
            const currentSaved = localStorage.getItem('savedArticles');
            const currentArticles = currentSaved ? JSON.parse(currentSaved) : [];

            // إزالة المقال
            const updatedArticles = currentArticles.filter((article: SavedArticle) => String(article.id) !== String(articleId));

            // حفظ في localStorage
            localStorage.setItem('savedArticles', JSON.stringify(updatedArticles));

            // تحديث الحالة
            setSavedArticles(updatedArticles);

            console.log('Article removed from localStorage:', articleId);
            console.log('Updated articles:', updatedArticles);
            return true;
        } catch (error) {
            console.error('Error removing article:', error);
            return false;
        }
    };

    const isArticleSaved = (articleId: string) => {
        try {
            // قراءة مباشرة من localStorage لضمان الحصول على أحدث البيانات
            const currentSaved = localStorage.getItem('savedArticles');
            const currentArticles = currentSaved ? JSON.parse(currentSaved) : [];
            const result = currentArticles.some((article: SavedArticle) => String(article.id) === String(articleId));
            console.log('isArticleSaved check:', { articleId, result, savedCount: currentArticles.length });
            return result;
        } catch (error) {
            console.error('Error checking if article is saved:', error);
            return false;
        }
    };

    const clearAllSaved = () => {
        try {
            setSavedArticles([]);
            localStorage.removeItem('savedArticles');
            return true;
        } catch (error) {
            console.error('Error clearing saved articles:', error);
            return false;
        }
    };

    return {
        savedArticles,
        saveArticle,
        removeArticle,
        isArticleSaved,
        clearAllSaved,
        savedCount: savedArticles.length
    };
};
