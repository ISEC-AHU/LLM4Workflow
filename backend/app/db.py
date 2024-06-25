from contextlib import contextmanager

from psycopg2.errors import OperationalError
from psycopg2.extras import DictCursor
from psycopg2.pool import ThreadedConnectionPool


class Database:
    def __init__(self):
        self.pool = None

    def connect(self, dbname, user, password, host="localhost", port=5432, minconn=1, maxconn=10):
        try:
            self.pool = ThreadedConnectionPool(
                minconn=minconn,
                maxconn=maxconn,
                host=host,
                port=port,
                dbname=dbname,
                user=user,
                password=password
            )
        except OperationalError as e:
            print(f"The error '{e}' occurred when db init")

    @contextmanager
    def get_connection(self):
        if self.pool is None:
            raise OperationalError("Database pool is not initialized")

        conn = self.pool.getconn()
        try:
            yield conn
        finally:
            self.pool.putconn(conn)

    def execute_query(self, query, params=None):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=DictCursor) as cursor:
                cursor.execute(query, params)
                conn.commit()

    def fetch_query(self, query, params=None):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=DictCursor) as cursor:
                cursor.execute(query, params)
                result = cursor.fetchall()
        return result

    def close(self):
        if self.pool:
            self.pool.closeall()

'''
if __name__ == '__main__':
    db = Database()
    db_config = {
        "dbname": "postgres",
        "user": "postgres",
        "password": "123456",
        "host": "localhost",
        "port": 5432
    }
    db.connect(**db_config)
'''