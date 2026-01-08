import http.server
import socketserver

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Сервер запущен на http://localhost:{PORT}/pages/")
    print("Для остановки сервера нажмите Ctrl+C")
    httpd.serve_forever()