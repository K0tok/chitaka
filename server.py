#!/usr/bin/env python3
"""
Простой HTTP сервер для проекта "Читака"
"""
import http.server
import socketserver
import os

# Убедимся, что мы в правильной директории
os.chdir('/workspace/Читака')

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Сервер запущен на http://localhost:{PORT}")
    print("Для остановки сервера нажмите Ctrl+C")
    httpd.serve_forever()