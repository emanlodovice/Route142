from node import Node

class AStar(object):

    def get_path(self, starting_point, destination_point):
        open_list = {}
        closed_list = {}

        starting_node = Node(starting_point, destination_point)
        open_list[starting_point.id] = starting_node

        has_path = False
        destination_node = None

        while len(open_list) > 0:
            current_node = min(n for n in open_list.values())
            id = current_node.id
            del open_list[id]
            closed_list[id] = current_node

            for connection in (list(current_node.point.connections1.all()) + \
            list(current_node.point.connections2.filter(oneway=False).all())):
                v2id = connection.vertex2.id
                if v2id == destination_point.id:
                    has_path = True
                    destination_node = Node(connection.vertex2, 
                        destination_point, current_node, connection.id)
                elif v2id in open_list:
                    node = open_list[v2id]
                    if node.g_value > current_node.g_value+connection.distance:
                        node.parent = current_node
                        node.g_value = current_node.g_value+connection.distance
                elif v2id not in closed_list:
                    open_list[v2id] = Node(connection.vertex2, 
                        destination_point, current_node, connection.id,
                        current_node.g_value + connection.distance)

        if has_path:
            path = []
            current_node = destination_node
            while (current_node.connection_id != None):
                path = [current_node.connection_id, current_node.id] + path
                current_node = current_node.parent
            path = [current_node.id] + path
            return path
        else:
            raise Exception('No path found!')

