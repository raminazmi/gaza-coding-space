import { useAppDispatch, useAppSelector } from '@/hooks';
import { 
  setCourseData, 
  setLectureData, 
  setTeacherData, 
  setArticleData, 
  setServiceData,
  setPortfolioData,
  clearBreadcrumbData,
  clearCourseData,
  clearLectureData,
  clearServiceData
} from '@/store/slices/breadcrumbSlice';

export const useBreadcrumb = () => {
  const dispatch = useAppDispatch();
  const breadcrumbData = useAppSelector((state) => state.breadcrumb.data);

  const setCourse = (courseData: { name: string; id: string; teacherName?: string; teacherId?: string }) => {
    dispatch(setCourseData(courseData));
  };

  const setLecture = (lectureData: { name: string; id: string }) => {
    dispatch(setLectureData(lectureData));
  };

  const setTeacher = (teacherData: { name: string; id: string }) => {
    dispatch(setTeacherData(teacherData));
  };

  const setArticle = (articleData: { title: string; id: string }) => {
    dispatch(setArticleData(articleData));
  };

  const setService = (serviceData: { name: string; id: string }) => {
    dispatch(setServiceData(serviceData));
  };

  const setPortfolio = (portfolioData: { title: string; id: string }) => {
    dispatch(setPortfolioData(portfolioData));
  };

  const clearAll = () => {
    dispatch(clearBreadcrumbData());
  };

  const clearCourse = () => {
    dispatch(clearCourseData());
  };

  const clearLecture = () => {
    dispatch(clearLectureData());
  };

  const clearService = () => {
    dispatch(clearServiceData());
  };

  return {
    // Data
    breadcrumbData,
    courseName: breadcrumbData.courseName,
    lectureName: breadcrumbData.lectureName,
    teacherName: breadcrumbData.teacherName,
    articleTitle: breadcrumbData.articleTitle,
    serviceName: breadcrumbData.serviceName,
    portfolioTitle: breadcrumbData.portfolioTitle,
    
    // Actions
    setCourse,
    setLecture,
    setTeacher,
    setArticle,
    setService,
    setPortfolio,
    clearAll,
    clearCourse,
    clearLecture,
    clearService,
  };
};

export default useBreadcrumb;