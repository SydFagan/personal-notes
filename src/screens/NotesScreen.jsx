import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import NoteModal from '../components/NoteModal';
import { colors } from '../theme';

const formatDate = (ts) =>
  ts?.toDate
    ? ts.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Just now';

export default function NotesScreen() {
  const { user, logOut } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  
  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
     
        const ms = (n) => n.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
        list.sort((a, b) => ms(b) - ms(a));
        setNotes(list);
        setLoading(false);
      },
      () => {
        setLoading(false);
        Alert.alert('Could not load notes', 'Check your connection and Firestore rules.');
      }
    );
    return unsub;
  }, [user.uid]);

  const visibleNotes = useMemo(
    () => (filter === 'favorites' ? notes.filter((n) => n.favorite) : notes),
    [notes, filter]
  );
  const favoriteCount = notes.filter((n) => n.favorite).length;

  const openNew = () => { setEditing(null); setModalVisible(true); };
  const openEdit = (note) => { setEditing(note); setModalVisible(true); };

  const saveNote = async ({ title, content }) => {
    if (editing) {
      await updateDoc(doc(db, 'tasks', editing.id), { title, content });
    } else {
      await addDoc(collection(db, 'tasks'), {
        title, content, favorite: false, userId: user.uid, createdAt: serverTimestamp(),
      });
    }
    setModalVisible(false);
  };

  const toggleFavorite = (note) =>
    updateDoc(doc(db, 'tasks', note.id), { favorite: !note.favorite }).catch(() =>
      Alert.alert('Could not update', 'Try again.')
    );

  const confirmDelete = (note) =>
    Alert.alert('Delete note?', `"${note.title}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => deleteDoc(doc(db, 'tasks', note.id)).catch(() => Alert.alert('Could not delete', 'Try again.')),
      },
    ]);

  const confirmLogout = () =>
    Alert.alert('Log out?', 'You can log back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logOut },
    ]);

  const renderNote = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(item)} hitSlop={10}>
          <Ionicons
            name={item.favorite ? 'star' : 'star-outline'}
            size={22}
            color={item.favorite ? colors.favorite : colors.muted}
          />
        </TouchableOpacity>
      </View>
      {!!item.content && <Text style={styles.preview} numberOfLines={2}>{item.content}</Text>}
      <View style={styles.cardBottom}>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEdit(item)} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Notes</Text>
          <Text style={styles.count}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} · {favoriteCount} favorite{favoriteCount === 1 ? '' : 's'}
          </Text>
        </View>
        <TouchableOpacity onPress={confirmLogout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.ink} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {[['all', 'All notes'], ['favorites', 'Favorites']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, filter === key && styles.tabActive]}
            onPress={() => setFilter(key)}
          >
            <Text style={[styles.tabText, filter === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={visibleNotes}
          keyExtractor={(n) => n.id}
          renderItem={renderNote}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name={filter === 'favorites' ? 'star-outline' : 'document-text-outline'} size={44} color={colors.muted} />
              <Text style={styles.emptyTitle}>
                {filter === 'favorites' ? 'No favorites yet' : 'No notes yet'}
              </Text>
              <Text style={styles.emptyText}>
                {filter === 'favorites'
                  ? 'Tap the star on a note to add it here.'
                  : 'Tap the + button to write your first note.'}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openNew} accessibilityLabel="Add note">
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <NoteModal
        visible={modalVisible}
        note={editing}
        onClose={() => setModalVisible(false)}
        onSave={saveNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg },

  header:
   { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
     paddingTop: 8, 
    paddingBottom: 12
   },

  title: { 
    fontSize: 28, 
    fontWeight: '800',
     color: colors.ink },

  count: {
     color: colors.muted,
      marginTop: 2 },

  logout: {
     flexDirection: 'row', alignItems: 'center',
      gap: 4,
       padding: 8 },

  logoutText: { 
    color: colors.ink, 
    fontWeight: '600' },

  tabs: {
     flexDirection: 'row', marginHorizontal: 20, backgroundColor: colors.line, borderRadius: 10,
      padding: 3,
       marginBottom: 8
       },

  tab: { 
    flex: 1, 
    paddingVertical: 8, 
    borderRadius: 8, 
    alignItems: 'center' },

  tabActive: {
     backgroundColor: colors.surface },

  tabText: { 
    color: colors.muted, 
    fontWeight: '600' },

  tabTextActive: {
     color: colors.primary },

  list: {
     padding: 20, 
     paddingBottom: 110, 
     flexGrow: 1 },

  card: {
     backgroundColor: colors.surface, borderRadius: 14,
      padding: 16,
       marginBottom: 12, 
       borderWidth: 1, 
       borderColor: colors.line 
      },

  cardTop: {
     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
     gap: 12
     },

  cardTitle: {
     flex: 1, 
     fontSize: 17, 
     fontWeight: '700', 
     color: colors.ink 
    },

  preview: { 
    color: colors.muted,
     marginTop: 6, 
     lineHeight: 20
     },

  cardBottom: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
     marginTop: 12 
    },

  date: { 
    color: colors.muted,
     fontSize: 12 },

  actions: { 
    flexDirection: 'row',
     gap: 6 },

  iconBtn: { 
    padding: 6, 
    borderRadius: 8, 
    backgroundColor: colors.bg 
  },

  empty: { 
    alignItems: 'center', 
    marginTop: 70, 
    paddingHorizontal: 30
   },

  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: colors.ink, 
    marginTop: 12 
  },

  emptyText: { 
    color: colors.muted, 
    textAlign: 'center', 
    marginTop: 6
   },

  fab: {
    position: 'absolute', 
    right: 20, 
    bottom: 30,
     width: 60, 
     height: 60, 
     borderRadius: 30,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 6, 
    shadowColor: '#000', shadowOpacity: 0.2, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 3 },
  },
});
