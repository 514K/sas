d = {}
with open("spisok.txt") as file:
    for line in file:
        key, *value = line.split(':')
        d[key] = value 

date = input("Введите число (в виде дд.мм.гг): ")
print(d[date])
