import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Switch, Alert, ActivityIndicator, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { doc, getDoc, getDocs, query, where, collection, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function TeacherAttendanceScreen({ route, navigation  }) {
    const { selectedClassId: classId } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

        useEffect(() => {
        setLoading(true);
        const classRef = doc(db, 'classes', classId);
        const enrolQuery = query(collection(db, 'enrolment'), where('class', '==', classRef));

        // Listen realtime updates so UI stays in sync
        const unsubscribe = onSnapshot(enrolQuery, async (enrolSnap) => {
            try {
                const enrolmentList = [];
                enrolSnap.forEach((docSnap) => {
                    const data = docSnap.data();
                    enrolmentList.push({
                        enrolmentId: docSnap.id,
                        studentRef: data.student,
                        isPresent: typeof data.attendance === 'boolean' ? data.attendance : false
                    });
                });

                const studentDocs = await Promise.all(
                    enrolmentList.map((e) => getDoc(e.studentRef))
                );

                const studentsWithNames = enrolmentList.map((e, i) => ({
                    enrolmentId: e.enrolmentId,
                    name: studentDocs[i].data()?.name || 'Unnamed',
                    isPresent: e.isPresent,
                }));

                setStudents(studentsWithNames);
                setLoading(false);
            } catch (err) {
                Alert.alert('Error loading data', err.message);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [classId]);

    const togglePresence = (id, newVal) => {
        setStudents((prev) =>
            prev.map((stu) =>
                stu.enrolmentId === id ? { ...stu, isPresent: newVal } : stu
            )
        );
    };

    const markAllPresent = () => {
        setStudents((prev) =>
            prev.map((stu) => ({ ...stu, isPresent: true }))
        );
    };

    const deselectAll = () => {
        setStudents((prev) =>
            prev.map((stu) => ({ ...stu, isPresent: false }))
        );
    };

    const submitAttendance = async () => {
        try {
            const batch = writeBatch(db);
            students.forEach((stu) => {
                const enrolRef = doc(db, 'enrolment', stu.enrolmentId);
                batch.set(
                    enrolRef,
                    { attendance: stu.isPresent },
                    { merge: true }
                );
            });
            await batch.commit();
            Alert.alert('Attendance saved!', '', [
            {
                text: 'OK',
                onPress: () => navigation.navigate('TeacherHome'),
            },
        ]);

        } catch (err) {
            Alert.alert('Error saving attendance', err.message);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>Loading students...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Mark Attendance for {today}</Text>

                <FlatList
                    data={students}
                    keyExtractor={(item) => item.enrolmentId}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Switch
                                value={item.isPresent}
                                onValueChange={(val) => togglePresence(item.enrolmentId, val)}
                            />
                        </View>
                    )}
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={deselectAll}>
                        <Text style={styles.buttonText}>Deselect All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={markAllPresent}>
                        <Text style={styles.buttonText}>Mark All Present</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.rightButton]} onPress={submitAttendance}>
                        <Text style={styles.buttonText}>Submit Attendance</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F2F6FC',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    name: {
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 20,
        paddingBottom: 40,
        flexDirection: 'column',
        alignItems: 'center',

    },
    rightButton: {
        backgroundColor: '#4CAF50',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    button: {
        width: 210,
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        marginHorizontal: 30,
        backgroundColor: '#3a9dde',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
        marginBottom: 15,
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
