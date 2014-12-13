from singleton import Singleton
from vertex import Vertex
from edge import Edge
from path import Path

@Singleton
class Graph(object):

    def __init__(self):
        self._M = {}
        self._vertices = {}

    def add_vertex(self, vertex_id):
        if vertex_id not in self._vertices:
            self._vertices[vertex_id] = Vertex(vertex_id)
        else:
            print 'FUCK!'

    def add_edge(self, id, source_id, destination_id, weight, two_way=False):
        if source_id in self._vertices and destination_id in self._vertices:
            self._vertices[source_id].add_edge(
                id, self._vertices[destination_id], weight)
            if two_way:
                self._vertices[destination_id].add_edge(
                    id, self._vertices[source_id], weight)
        else:
            print 'FUCK!'

    def initialize_matrix(self):
        self._M = {}
        for i in self._vertices:
            self._M[i] = {}
            for j in self._vertices:
                self._M[i][j] = Path(self._vertices[i], self._vertices[j])

        print self._M

    def floyd_algorithm(self):
        for i in self._vertices:
            for j in self._vertices:
                for k in self._vertices:
                    if i != j:
                        a = self._M[j][k].total_weight
                        b = self._M[j][i].total_weight + self._M[i][k].total_weight
                        if a > b:
                            c = self._M[j][i].merge_path(self._M[i][k])
                            self._M[j][k] = c

            print self._M

g = Graph.get_instance()
g.add_vertex(1)
g.add_vertex(2)
g.add_vertex(3)
g.add_edge(1,1,2,6)
g.add_edge(2,2,3,5)
g.add_edge(3,3,1,20)
g.add_edge(4,1,3,30)

g.initialize_matrix()
print ''
g.floyd_algorithm()