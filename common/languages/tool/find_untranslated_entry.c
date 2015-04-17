#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MAX_WORD_COUNT 200

char* chuck(char* input);
int search(char* enrty, char* dic[], int top);
int insert(FILE* fd, char* word);

int main(int argc, char* argv[])
{
	if (argc != 3)
	{
		fprintf(stderr, "Usage: <compiled_file> <complete_language_file> <in_completed_language_file>\n");
		exit(1);
	}

	FILE *f_todo, *f_done; 
	if((f_done = fopen(argv[1], "r")) == NULL || (f_todo = fopen(argv[2],"r+")) == NULL)
	{
		fprintf(stderr, "Please authorize:\nread permission to '%s',\nread and write permissions to '%s'\n", argv[1], argv[2]);
		exit(1);
	}

	char* dictionary[26][MAX_WORD_COUNT];
	char *line = NULL;
	size_t len = 0;
	int word_counter[26];
	int alpha_idx;
	char* word;
	while (!feof(f_todo))
	{
		if(getline(&line,&len,f_todo) != -1)
		{
			if (line[2] != ' ' && line[2] != '\n' && line[2] != '\0')
			{
				if(word = chuck(&line[2]))  //valid enrty
				{
					if (line[2] >= 'a')
					{
						alpha_idx = (int)(line[2]-'a');
					}
					else
					{
						alpha_idx = (int)(line[2]-'A');
					}
					dictionary[alpha_idx][word_counter[alpha_idx]] = word;
					word_counter[alpha_idx]++;
				}
			}
		}
	}

	while (!feof(f_done))
	{
		if(getline(&line,&len,f_done) != -1)
		{
			if (line[2] != ' ' && line[2] != '\n' && line[2] != '\0')
			{
				if(word = chuck(&line[2]))  //valid enrty
				{
					if (line[2] >= 'a')
					{
						alpha_idx = (int)(line[2]-'a');
					}
					else
					{
						alpha_idx = (int)(line[2]-'A');
					}
					if(!search(word, dictionary[alpha_idx], word_counter[alpha_idx]))
					{
						printf("%s\n", word);
						if(!insert(f_todo, word))
						{
							fprintf(stderr, "Cannot open input files\n");
							exit(1);
						}
					}
				}
			}
		}
	}
	fclose(f_done);
	fclose(f_todo);

	return 0;
}

char* chuck(char* input)
{
	char* result;
	int i=0;
	while(input[i] != '\0')
	{
		if(input[i] == '"')
		{
			break;
		}
		i++;
	}

	if(i>1)
	{
		result = (char*)malloc((i+1)*sizeof(char));
		memcpy(result, input, i);
		result[i] = '\0';
	}
	else
	{
		result = NULL;
	}

	return result;
}

int search(char* enrty, char* dic[], int top)
{
	int i;
	for(i=0;i<top;i++)
	{
		if(!strcmp(enrty, dic[i]))
		{
			return 1;
		}
	}
	return 0;
}

int insert(FILE* fd, char* word)
{
	if(fprintf(fd, "\t\"%s\":\n", word) > 0)
	{
		return 1;
	}
	else
	{
		return 0;
	}
}