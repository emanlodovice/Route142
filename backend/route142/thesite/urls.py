from django.conf.urls import patterns, url

from thesite.views import IndexView

urlpatterns = patterns('',
    url(r'^$', IndexView.as_view()),
)