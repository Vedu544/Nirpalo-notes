import React, { useState, useEffect } from 'react';
import { Activity, FileText, User, Clock } from 'lucide-react';
import { activityAPI } from '../api';
import toast from 'react-hot-toast';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, create, update, delete, share

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getUserActivity();
      setActivities(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch activity log');
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return <div className="activity-icon bg-success-100 text-success-600">+</div>;
      case 'UPDATE':
        return <div className="activity-icon bg-primary-100 text-primary-600">✓</div>;
      case 'DELETE':
        return <div className="activity-icon bg-error-100 text-error-600">×</div>;
      case 'SHARE':
        return <div className="activity-icon bg-warning-100 text-warning-600">↑</div>;
      default:
        return <div className="activity-icon bg-secondary-100 text-secondary-600">•</div>;
    }
  };

  const getActivityText = (activity) => {
    const action = activity.action.toLowerCase();
    const noteTitle = activity.note?.title || 'Untitled Note';
    
    switch (activity.action) {
      case 'CREATE':
        return `Created note "${noteTitle}"`;
      case 'UPDATE':
        return `Updated note "${noteTitle}"`;
      case 'DELETE':
        return `Deleted note "${noteTitle}"`;
      case 'SHARE':
        return `Shared note "${noteTitle}"`;
      default:
        return `Action on "${noteTitle}"`;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.action === filter.toUpperCase();
  });

  const getActivityStats = () => {
    const stats = {
      total: activities.length,
      create: activities.filter(a => a.action === 'CREATE').length,
      update: activities.filter(a => a.action === 'UPDATE').length,
      delete: activities.filter(a => a.action === 'DELETE').length,
      share: activities.filter(a => a.action === 'SHARE').length,
    };
    return stats;
  };

  if (loading) {
    return <LoadingSpinner text="Loading activity log..." />;
  }

  const stats = getActivityStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Activity Log</h1>
        <p className="page-subtitle">Track your recent note activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-secondary-900">{stats.total}</div>
            <div className="text-sm text-secondary-600">Total Activities</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-success-600">{stats.create}</div>
            <div className="text-sm text-secondary-600">Created</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600">{stats.update}</div>
            <div className="text-sm text-secondary-600">Updated</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-error-600">{stats.delete}</div>
            <div className="text-sm text-secondary-600">Deleted</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-warning-600">{stats.share}</div>
            <div className="text-sm text-secondary-600">Shared</div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Activities' },
              { value: 'create', label: 'Created' },
              { value: 'update', label: 'Updated' },
              { value: 'delete', label: 'Deleted' },
              { value: 'share', label: 'Shared' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Activities */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No activities found
          </h3>
          <p className="text-secondary-600">
            {filter === 'all' 
              ? 'Start creating and editing notes to see your activity here'
              : `No ${filter} activities found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              {getActivityIcon(activity.action)}
              <div className="activity-content">
                <p className="text-sm font-medium text-secondary-900">
                  {getActivityText(activity)}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-3 h-3 text-secondary-400" />
                  <span className="activity-time">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
