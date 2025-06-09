import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

export default function useStudentClasses() {
  const [classes, setClasses] = useState([]);
  const [classSubjects, setClassSubjects] = useState({});
  const [classTeachers, setClassTeachers] = useState({});
  const [classCounts, setClassCounts] = useState({});
  const [enrolledClassIds, setEnrolledClassIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);

  const auth = getAuth();
  const studentId = auth.currentUser?.uid;

  useEffect(() => {
    if (!studentId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const classSnap = await getDocs(collection(db, 'classes'));
        const classList = classSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClasses(classList);

        const enrollmentSnap = await getDocs(collection(db, 'enrolment'));
        const counts = {};
        const enrolledIds = [];
        enrollmentSnap.docs.forEach(docSnap => {
          const data = docSnap.data();
          let classId = data.class?.id || (typeof data.class === 'string' ? data.class.split('/').pop() : null);
          let enrolledStudentId = data.student?.id || (typeof data.student === 'string' ? data.student.split('/').pop() : null);
          if (classId) {
            counts[classId] = (counts[classId] || 0) + 1;
          }
          if (enrolledStudentId === studentId && classId) {
            enrolledIds.push(classId);
          }
        });
        setClassCounts(counts);
        setEnrolledClassIds(enrolledIds);

        for (const cls of classList) {
          let subjectId = cls.subject?.id || (typeof cls.subject === 'string' ? cls.subject.split('/').pop() : null);
          if (subjectId && !classSubjects[cls.id]) {
            const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
            setClassSubjects(prev => ({
              ...prev,
              [cls.id]: subjectSnap.exists() ? subjectSnap.data().name : subjectId,
            }));
          }
          let teacherId = cls.professor?.id || (typeof cls.professor === 'string' ? cls.professor.split('/').pop() : null);
          if (teacherId && !classTeachers[cls.id]) {
            const teacherSnap = await getDoc(doc(db, 'users', teacherId));
            setClassTeachers(prev => ({
              ...prev,
              [cls.id]: teacherSnap.exists() ? teacherSnap.data().name : teacherId,
            }));
          }
        }
      } catch (err) {
        Alert.alert('Error loading classes');
      }
      setLoading(false);
    };
    fetchData();
  }, [studentId]);

  useEffect(() => {
    const fetchOptions = async () => {
      const subjSnap = await getDocs(collection(db, 'subjects'));
      setSubjectOptions(subjSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      })));
      const userSnap = await getDocs(collection(db, 'users'));
      const teachers = userSnap.docs
        .filter(doc => (doc.data().roles || []).includes('teacher'))
        .map(doc => ({
          id: doc.id,
          name: doc.data().name,
          subjects: doc.data().subjects || [],
        }));
      setAllTeachers(teachers);
      setTeacherOptions(teachers);
    };
    fetchOptions();
  }, []);

  return {
    classes,
    classSubjects,
    classTeachers,
    classCounts,
    enrolledClassIds,
    loading,
    subjectOptions,
    teacherOptions,
    setTeacherOptions,
    allTeachers,
    setAllTeachers,
    setClassSubjects,
    setClassTeachers,
    setEnrolledClassIds,
    setClassCounts,
  };
}