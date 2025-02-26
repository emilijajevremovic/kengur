def best_long_jump_participant():
    n = int(input().strip())  # Broj polaznika
    best_name = ""
    best_avg = -1

    for _ in range(n):
        name = input().strip()  # Ime polaznika
        jump1 = float(input().strip())  # Prvi skok
        jump2 = float(input().strip())  # Drugi skok
        avg = (jump1 + jump2) / 2

        if avg > best_avg:
            best_avg = avg
            best_name = name

    print(best_name)

# Pokretanje funkcije
best_long_jump_participant()