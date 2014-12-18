import json

from django.http import HttpResponse
from django.views.generic import TemplateView, View
from django.db.models import Q

from models import Point, Connection
from graph.graph import Graph
from graph.astar import AStar


class IndexView(TemplateView):
    template_name = 'index.html'


class InfoQueryView(View):

    def get(self, *args, **kwargs):
        data = json.loads(self.request.GET['data'])
        query = data['query']
        results = Point.objects.filter(Q(name__istartswith=query + ' ') | 
                                       Q(name__icontains=' ' + query + ' ') |
                                       Q(name__icontains=' ' + query) | 
                                       Q(name__iexact=query))
        results_list = []
        for result in results:
            result_json = {}
            result_json['type'] = result.typ
            result_json['coordinates'] = [result.lat, result.lon]
            result_json['name'] = result.name
            result_json['id'] = result.pk
            results_list.append(result_json)
        return HttpResponse(json.dumps(results_list))


class SuggestQueryView(View):

    def get(self, *args, **kwargs):
        data = json.loads(self.request.GET['data'])
        query = data['query']
        results = Point.objects.filter(name__istartswith=query).all()
        results_list = []
        for result in results:
            result_json = {}
            result_json['type'] = result.typ
            result_json['coordinates'] = [result.lat, result.lon]
            result_json['name'] = result.name
            result_json['id'] = result.pk
            results_list.append(result_json)
        return HttpResponse(json.dumps(results_list))


class NearPointsView(View):

    def get(self, *args, **kwargs):
        data = json.loads(self.request.GET['data'])
        nw = data['northwest']
        se = data['southeast']
        points = Point.objects.filter(
            lat__lte=nw[0], lat__gte=se[0], lon__gte=nw[1], lon__lte=se[1]).\
            all()
        results_list = []
        for p in points:
            for p1 in p.connections1.all():
                road = {'type': 'road', 'start': [p.lat, p.lon], 'end': [p1.vertex2.lat, p1.vertex2.lon], 'traffic': 'light', 'source_id': p.pk, 'destination_id': p1.vertex2.pk}
                results_list.append(road)
            if p.is_landmark:
                point = {'coordinates': [p.lat, p.lon], 'name': p.name,
                         'type': p.typ, 'is_landmark': p.is_landmark, 'id': p.pk}
                results_list.append(point)
        return HttpResponse(json.dumps(results_list))


class GetPathView(View):

    def get(self, *args, **kwargs):
        data = json.loads(self.request.GET['data'])
        source_id = data['source']
        dest_id = data['destination']
        # g = Graph.get_instance()
        source = Point.objects.get(pk=source_id)
        destination = Point.objects.get(pk=dest_id)
        results_list = []
        try:
            path = AStar().get_path(source, destination)
            print len(path)
            if len(path) > 1:
                s = self.parse_point(Point.objects.get(pk=path[0]))
                results_list.append(s)
                index = 1
                while index < (len(path) - 1):
                    con = Connection.objects.get(pk=path[index])
                    p1 = con.vertex1
                    p2 = con.vertex2
                    p = self.parse_edge(p1, p2)
                    results_list.append(p)
                    index += 2
                s = self.parse_point(Point.objects.get(pk=path[-1]))
                results_list.append(s)
        except Exception:
            pass
        return HttpResponse(json.dumps(results_list))

    def parse_point(self, point):
        data = {
            'type': point.typ,
            'coordinates': [point.lat, point.lon],
            'name': point.name,
            'id': point.pk
        }
        return data

    def parse_edge(self, source, dest):
        data = {
            'type': 'road',
            'start': [source.lat, source.lon], 
            'end': [dest.lat, dest.lon],
            'traffic': 'light'
        }
        return data


class AddConnectionView(View):

    def get(self, *args, **kwargs):
        data = json.loads(self.request.GET['data'])
        source_id = data['source_id']
        destination_id = data['destination_id']

        source = Point.objects.get(pk=source_id)
        destination = Point.objects.get(pk=destination_id)

        if not (Connection.objects.filter(vertex1=source, vertex2=destination) 
                and Connection.objects.filter(vertex1=destination, vertex2=source,
                oneway=False)):
            Connection.objects.create(vertex1=source, vertex2=destination,
                oneway=False)
            return HttpResponse("true")
        return HttpResponse("false")
