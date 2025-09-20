import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Skeleton } from '../components/ui/skeleton';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllNotifications = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/notifications?limit=50'); // Lấy 50 thông báo
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch page notifications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllNotifications();
    }, []);

    if (loading) return <Skeleton className="w-full h-96" />;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">All Notifications</h1>
            <div className="bg-card p-6 rounded-2xl border border-border">
                {notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map(notif => (
                            <div key={notif._id} className="p-4 rounded-lg hover:bg-secondary">
                                {/* Hiển thị thông báo chi tiết hơn ở đây */}
                                <p>...</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>You have no notifications yet.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;