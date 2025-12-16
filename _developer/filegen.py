date_num=int(input())
# Base52 encoding (a-zA-Z)
base52 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
encoded = ""

while date_num > 0:
    date_num, remainder = divmod(date_num, 52)
    encoded = base52[remainder] + encoded

# Pad to minimum 4 characters
while len(encoded) < 4:
    encoded = base52[0] + encoded

print(encoded)