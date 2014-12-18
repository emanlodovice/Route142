from django.conf.urls import patterns, url

from thesite.views import IndexView, InfoQueryView, NearPointsView, GetPathView, SuggestQueryView, AddConnectionView

urlpatterns = patterns('',
    url(r'^$', IndexView.as_view()),
    url(r'^query/$', InfoQueryView.as_view()),
    url(r'^near-points/$', NearPointsView.as_view()),
    url(r'^get-path/$', GetPathView.as_view()),
    url(r'^suggest/$', SuggestQueryView.as_view()),
    url(r'^add-path/$', AddConnectionView.as_view()),
)