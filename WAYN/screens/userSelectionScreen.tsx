// screens/UserSelectionScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/authContext';
import { db, User } from '../utils/supabase';
import { theme } from '../assets/theme';

export default function UserSelectionScreen() {
  const { selectUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await db
        .from('users')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelecting(user.id);
    try {
      await selectUser(user.id);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.waynOrange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[theme.text.headline1, styles.title]}>Select Your User</Text>
        <Text style={[theme.text.body2, styles.subtitle]}>
          Choose who you want to test as
        </Text>
      </View>

      <View style={styles.userList}>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[
              styles.userCard,
              user.is_active && styles.userCardDisabled,
            ]}
            onPress={() => handleSelectUser(user)}
            disabled={selecting !== null || user.is_active}
          >
            <View style={styles.userCardContent}>
              <View style={styles.avatarContainer}>
                {user.profile_icon_url ? (
                  <Image
                    source={{ uri: user.profile_icon_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>
                      {user.display_name[0]}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.userInfo}>
                <Text style={theme.text.headline3}>
                  {user.display_name}
                </Text>
                <Text style={[theme.text.body3, styles.userLocation]}>
                  {user.current_address || 'No location'}
                </Text>
                {user.current_status && (
                  <Text style={[theme.text.body3Bold, styles.userStatus]}>
                    {user.current_status}
                  </Text>
                )}
              </View>

              {user.is_active && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>In Use</Text>
                </View>
              )}

              {selecting === user.id && (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.waynOrange}
                  style={styles.selectingIndicator}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[theme.text.body3, styles.note]}>
        Note: Each user can only be logged in on one device at a time
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
  userList: {
    flex: 1,
    gap: theme.spacing.md,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: "#e1e1e1ff",
    elevation: 3,
  },
  userCardDisabled: {
    opacity: 0.5,
    borderColor: theme.colors.textSecondary,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarContainer: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.waynOrangeLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.waynOrange,
  },
  userInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  userLocation: {
    color: theme.colors.textSecondary,
  },
  userStatus: {
    color: theme.colors.waynOrange,
    textTransform: 'capitalize',
  },
  activeBadge: {
    backgroundColor: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  activeBadgeText: {
    ...theme.text.body3Bold,
    color: 'white',
  },
  selectingIndicator: {
    marginLeft: theme.spacing.sm,
  },
  note: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});