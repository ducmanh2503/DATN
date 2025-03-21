import React, { useEffect, useState } from 'react';
import styles from './Profile.module.css';
import { getProfile } from "../../../services/profileService";
import { UserProfile } from '../../types/profileTypes'; 

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfile();
        setProfile(userData);
      } catch (err) {
        setError('Không thể tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className={styles.loading}>Đang tải...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hồ sơ người dùng</h1>
      {profile && (
        <div className={styles.profileCard}>
          <div className={styles.profileItem}>
            <span className={styles.label}>Họ tên:</span>
            <span>{profile.name}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Email:</span>
            <span>{profile.email}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Số điện thoại:</span>
            <span>{profile.phone}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Hạng:</span>
            <span>{profile.rank}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Điểm:</span>
            <span>{profile.points}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Tổng chi tiêu:</span>
            <span>{profile.total_spent} VNĐ</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Vai trò:</span>
            <span>{profile.role}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Xác thực:</span>
            <span>{profile.is_verified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;