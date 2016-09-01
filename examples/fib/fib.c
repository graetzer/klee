#include <stdio.h>      /* printf, scanf, NULL */
#include <stdlib.h>     /* malloc, free, rand */

int main ()
{
  int n, len;
  printf("Enter the number of terms\n");
  scanf("%d",&n);
  len = n * 2 + 1;
  char *buffer = (char*) malloc(len);
  
  if (!buffer) {
    printf ("Simon: Malloc returned 0\n");
    return 1;
  }
  
  int pos = 0, first = 0, second = 1;
  for (int i = 0 ; i < n ; i++ ) {
    int next = first + second;
    first = second;
    second = next;
    
    if (pos+4>len) {
      len = 2 * len;
      buffer = realloc(buffer, len);
    }
    while(next != 0) {
      buffer[pos++] = '0' + (next % 10);
      next /= 10;
    }
    buffer[pos++] = ' ';
   }
    
  buffer[pos]='\0';
  printf ("Simon: fib %s\n", buffer);
  free (buffer);
  return 0;
}
