import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { colors } from '../theme';


export default function NoteModal({ visible, note, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(note?.title ?? '');
      setContent(note?.content ?? '');
    }
  }, [visible, note]);

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give your note a title before saving.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), content: content.trim() });
    } catch (e) {
      Alert.alert('Could not save', 'Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <Text style={styles.heading}>{note ? 'Edit note' : 'New note'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <TextInput
            style={[styles.input, styles.body]}
            placeholder="Write your note..."
            placeholderTextColor={colors.muted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.save]} onPress={save} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save note'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,33,61,0.45)',
   justifyContent: 'flex-end'
   },

  sheet: { 
    backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32
   },
   
  heading: {
     fontSize: 20, 
     fontWeight: '800',
      color: colors.ink, marginBottom: 14
     },

  input: {
    borderWidth: 1,
     borderColor: colors.line, borderRadius: 10, backgroundColor: colors.bg,
    paddingHorizontal: 14, paddingVertical: 12, 
    fontSize: 16,
     color: colors.ink, 
     marginBottom: 12,
  },

  body: {
     height: 180
     },

  row: {
     flexDirection: 'row',
      gap: 12 },

  btn: {
     flex: 1,
      paddingVertical: 14, borderRadius: 10, 
      alignItems: 'center'
     },

  cancel: {
     backgroundColor: colors.bg 
    },

  cancelText: {
     color: colors.ink,
      fontWeight: '700'
     },

  save: {
     backgroundColor: colors.primary 
    },

  saveText: {
     color: '#fff',
      fontWeight: '700' },
});
