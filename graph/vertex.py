from edge import Edge

class Vertex(object):

    def __init__(self, id):
        self.id = id
        self.edges = {}

    def add_edge(self, id, destination_vertex, weight):
        edge = Edge(id, self, destination_vertex, weight)
        self.edges[destination_vertex.id] = edge

    def has_edge(self, destination_vertex):
        return destination_vertex.id in self.edges

    def get_edge(self, destination_vertex):
        return self.edges[destination_vertex.id]
