import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, AlertCircle, CheckCircle, Clock, Filter, Search, Flag, Eye, EyeOff, Reply, Archive, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700 border-green-200',
  hidden: 'bg-gray-100 text-gray-700 border-gray-200',
  flagged: 'bg-red-100 text-red-700 border-red-200',
};

const PRIORITY_COLORS = {
  urgent: 'bg-red-50 text-red-700',
  normal: 'bg-blue-50 text-blue-700',
  low: 'bg-gray-50 text-gray-700',
};

function StarRating({ rating, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewActions({ review, onStatusChange, onReply }) {
  const [showReplyDialog, setShowReplyDialog] = useState(false);

  return (
    <div className="flex gap-2">
      {review.status === 'published' ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(review.id, 'hidden')}
          className="h-7 text-xs"
        >
          <EyeOff className="w-3 h-3 mr-1" />
          Hide
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(review.id, 'published')}
          className="h-7 text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          Show
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setShowReplyDialog(true);
          onReply?.(review);
        }}
        className="h-7 text-xs"
      >
        <Reply className="w-3 h-3 mr-1" />
        Reply
      </Button>
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">{review.reviewer_name}</p>
              <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
            </div>
            <Textarea
              placeholder="Write your response..."
              className="min-h-[100px]"
            />
            <Button className="w-full">Post Response</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IssueActions({ issue, onStatusChange, onPriorityChange }) {
  return (
    <div className="flex gap-2">
      <Select
        value={issue.priority}
        onValueChange={(value) => onPriorityChange(issue.id, value)}
      >
        <SelectTrigger className="h-7 text-xs w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="urgent">Urgent</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      {issue.status === 'open' ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(issue.id, 'resolved')}
          className="h-7 text-xs"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Resolve
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(issue.id, 'open')}
          className="h-7 text-xs"
        >
          <Archive className="w-3 h-3 mr-1" />
          Reopen
        </Button>
      )}
    </div>
  );
}

export default function ReviewsTab() {
  const [activeTab, setActiveTab] = useState('reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      try {
        return await base44.entities.Review.list('-created_date', 100);
      } catch {
        return [];
      }
    },
  });

  const { data: issues = [], isLoading: isLoadingIssues } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      try {
        return await base44.entities.Issue.list('-created_date', 100);
      } catch {
        return [];
      }
    },
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      try {
        return await base44.entities.Book.list();
      } catch {
        return [];
      }
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Review.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Issue.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) => {
        const matchesSearch =
          searchQuery === '' ||
          review.book_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.reviewer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.comment?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRating =
          ratingFilter === 'all' || review.rating === parseInt(ratingFilter);

        const matchesStatus =
          statusFilter === 'all' || review.status === statusFilter;

        return matchesSearch && matchesRating && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
        if (sortBy === 'oldest') return new Date(a.created_date) - new Date(b.created_date);
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'lowest') return a.rating - b.rating;
        return 0;
      });
  }, [reviews, searchQuery, ratingFilter, statusFilter, sortBy]);

  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        const matchesSearch =
          searchQuery === '' ||
          issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.book_title?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSeverity =
          severityFilter === 'all' || issue.severity === severityFilter;

        return matchesSearch && matchesSeverity;
      })
      .sort((a, b) => {
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (b.status === 'open' && a.status !== 'open') return 1;
        return new Date(b.created_date) - new Date(a.created_date);
      });
  }, [issues, searchQuery, severityFilter]);

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : '0.0';
    const publishedReviews = reviews.filter((r) => r.status === 'published').length;
    const hiddenReviews = reviews.filter((r) => r.status === 'hidden').length;
    const flaggedReviews = reviews.filter((r) => r.status === 'flagged').length;
    const openIssues = issues.filter((i) => i.status === 'open').length;
    const criticalIssues = issues.filter(
      (i) => i.status === 'open' && (i.severity === 'critical' || i.severity === 'high')
    ).length;

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
      percentage: totalReviews > 0 ? (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100 : 0,
    }));

    return {
      totalReviews,
      avgRating,
      publishedReviews,
      hiddenReviews,
      flaggedReviews,
      openIssues,
      criticalIssues,
      ratingDistribution,
    };
  }, [reviews, issues]);

  const handleReviewStatusChange = (reviewId, newStatus) => {
    updateReviewMutation.mutate({
      id: reviewId,
      data: { status: newStatus },
    });
  };

  const handleIssueStatusChange = (issueId, newStatus) => {
    updateIssueMutation.mutate({
      id: issueId,
      data: { status: newStatus },
    });
  };

  const handleIssuePriorityChange = (issueId, newPriority) => {
    updateIssueMutation.mutate({
      id: issueId,
      data: { priority: newPriority },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reviews & Issues</h1>
        <p className="text-muted-foreground mt-1">
          Monitor reader feedback, manage reviews, and track content issues.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
                <p className="text-xl font-bold">{stats.totalReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
                <p className="text-xl font-bold">{stats.avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Published</p>
                <p className="text-xl font-bold">{stats.publishedReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hidden</p>
                <p className="text-xl font-bold">{stats.hiddenReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Open Issues</p>
                <p className="text-xl font-bold">{stats.openIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flag className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-xl font-bold">{stats.criticalIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reviews">
            <MessageSquare className="w-4 h-4 mr-2" />
            Reviews ({filteredReviews.length})
          </TabsTrigger>
          <TabsTrigger value="issues">
            <AlertCircle className="w-4 h-4 mr-2" />
            Issues ({filteredIssues.filter(i => i.status === 'open').length})
          </TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="highest">Highest Rated</SelectItem>
                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium">{rating} star</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-muted-foreground text-right">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingReviews ? (
                <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reviews found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                              {review.reviewer_name?.[0] || 'R'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{review.reviewer_name || 'Anonymous'}</p>
                              <p className="text-xs text-muted-foreground">
                                {review.book_title} · {new Date(review.created_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`ml-auto ${STATUS_COLORS[review.status]}`}
                            >
                              {review.status}
                            </Badge>
                          </div>
                          <div className="mb-2">
                            <StarRating rating={review.rating} size="lg" />
                          </div>
                          <p className="text-sm text-foreground/80 mb-3">{review.comment}</p>
                          {review.author_response && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-3">
                              <p className="text-xs font-medium text-primary mb-1">Author Response</p>
                              <p className="text-sm">{review.author_response}</p>
                            </div>
                          )}
                        </div>
                        <ReviewActions
                          review={review}
                          onStatusChange={handleReviewStatusChange}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search issues..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {stats.criticalIssues > 0 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                You have {stats.criticalIssues} critical issue{stats.criticalIssues > 1 ? 's' : ''} requiring immediate attention.
              </AlertDescription>
            </Alert>
          )}

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingIssues ? (
                <div className="text-center py-8 text-muted-foreground">Loading issues...</div>
              ) : filteredIssues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No issues found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Flag
                              className={`w-5 h-5 ${
                                issue.severity === 'critical'
                                  ? 'text-red-600'
                                  : issue.severity === 'high'
                                  ? 'text-orange-600'
                                  : issue.severity === 'medium'
                                  ? 'text-amber-600'
                                  : 'text-blue-600'
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium">{issue.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {issue.book_title} · Reported {new Date(issue.created_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`ml-2 ${SEVERITY_COLORS[issue.severity]}`}
                            >
                              {issue.severity}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${
                                issue.status === 'open'
                                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                                  : 'bg-green-100 text-green-700 border-green-200'
                              }`}
                            >
                              {issue.status}
                            </Badge>
                            {issue.priority && (
                              <Badge
                                variant="outline"
                                className={`${PRIORITY_COLORS[issue.priority]}`}
                              >
                                {issue.priority}
                              </Badge>
                            )}
                          </div>
                          {issue.description && (
                            <p className="text-sm text-foreground/80 mb-3">{issue.description}</p>
                          )}
                          {issue.reporter_name && (
                            <p className="text-xs text-muted-foreground">
                              Reported by: {issue.reporter_name}
                            </p>
                          )}
                        </div>
                        <IssueActions
                          issue={issue}
                          onStatusChange={handleIssueStatusChange}
                          onPriorityChange={handleIssuePriorityChange}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}