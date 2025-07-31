import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BreadcrumbData {
  courseName?: string;
  courseId?: string;
  lectureName?: string;
  lectureId?: string;
  teacherName?: string;
  teacherId?: string;
  articleTitle?: string;
  articleId?: string;
  serviceName?: string;
  serviceId?: string;
  portfolioTitle?: string;
  portfolioId?: string;
}

interface BreadcrumbState {
  data: BreadcrumbData;
}

const initialState: BreadcrumbState = {
  data: {}
};

export const breadcrumbSlice = createSlice({
  name: 'breadcrumb',
  initialState,
  reducers: {
    setCourseData: (state, action: PayloadAction<{ name: string; id: string; teacherName?: string; teacherId?: string }>) => {
      state.data.courseName = action.payload.name;
      state.data.courseId = action.payload.id;
      if (action.payload.teacherName) {
        state.data.teacherName = action.payload.teacherName;
      }
      if (action.payload.teacherId) {
        state.data.teacherId = action.payload.teacherId;
      }
    },
    setLectureData: (state, action: PayloadAction<{ name: string; id: string }>) => {
      state.data.lectureName = action.payload.name;
      state.data.lectureId = action.payload.id;
    },
    setTeacherData: (state, action: PayloadAction<{ name: string; id: string }>) => {
      state.data.teacherName = action.payload.name;
      state.data.teacherId = action.payload.id;
    },
    setArticleData: (state, action: PayloadAction<{ title: string; id: string }>) => {
      state.data.articleTitle = action.payload.title;
      state.data.articleId = action.payload.id;
    },
    setServiceData: (state, action: PayloadAction<{ name: string; id: string }>) => {
      state.data.serviceName = action.payload.name;
      state.data.serviceId = action.payload.id;
    },
    setPortfolioData: (state, action: PayloadAction<{ title: string; id: string }>) => {
      state.data.portfolioTitle = action.payload.title;
      state.data.portfolioId = action.payload.id;
    },
    clearBreadcrumbData: (state) => {
      state.data = {};
    },
    clearCourseData: (state) => {
      state.data.courseName = undefined;
      state.data.courseId = undefined;
      state.data.lectureName = undefined;
      state.data.lectureId = undefined;
    },
    clearLectureData: (state) => {
      state.data.lectureName = undefined;
      state.data.lectureId = undefined;
    }
  },
});

export const {
  setCourseData,
  setLectureData,
  setTeacherData,
  setArticleData,
  setServiceData,
  setPortfolioData,
  clearBreadcrumbData,
  clearCourseData,
  clearLectureData
} = breadcrumbSlice.actions;

export default breadcrumbSlice.reducer;