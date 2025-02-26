#include <stdio.h>
#include <string.h>

int main() {
    int n;
    scanf("%d", &n);

    char best_name[101];  // Pretpostavljamo da ime ima najviše 100 karaktera
    double best_avg = -1.0;

    for (int i = 0; i < n; i++) {
        char name[101];
        double jump1, jump2;

        scanf("%s", name);
        scanf("%lf", &jump1);
        scanf("%lf", &jump2);

        double avg = (jump1 + jump2) / 2.0;
        if (avg > best_avg) {
            best_avg = avg;
            strcpy(best_name, name);
        }
    }

    printf("%s\n", best_name);
    return 0;
}