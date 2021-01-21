import {Command, CommandMessage, Description, Guard, Infos} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdminWithResponse} from "../../guards/IsAdminWithResponse";
import {curseService} from "../../services/CurseService";
import {CREATE_DEFAULT_EMBED} from "../../utils/constants";

type WordCount = {
    word: string,
    count: number
}

export abstract class GetDoubleCurse {

    @Command("doubleCurse")
    @Infos({forAdmins: true, description: "Get double curse words in the curse list"})
    @Guard(NotBotMessage, IsAdminWithResponse)
    async calculateDoubleCurses(message: CommandMessage): Promise<void> {
        const response = CREATE_DEFAULT_EMBED("Double words are: ", "These words are double or include other words. Remove them for better performance. Fuck is equal to fucker")
        curseService.loadWords();
        const doubleWords: WordCount[] = []

        //We need to pick a word to then compare with others. The first loop picks a word, the second one will loop through the others.
        //Only count occurences if the words are different, and only register it if the occurrences count is > 0
        for (let i = 0; i < curseService.curseWords.length; i++) {
            for (let j = 0; j < curseService.curseWords.length; j++) {
                const baseWord = curseService.curseWords[i];
                const wordToCompareWith = curseService.curseWords[j];
                if (baseWord !== wordToCompareWith) {
                    const count = curseService.occurrences(baseWord, wordToCompareWith, false);
                    if (count > 0) {
                        const word = doubleWords.find(words => words.word === baseWord);
                        if (word) {
                            word.count += count;
                        } else {
                            doubleWords.push({count: count, word: baseWord})
                        }
                    }
                }
            }
        }

        for (const doubleWord of doubleWords) {
            response.addField(doubleWord.word, `Count: ${doubleWord.count}`)
        }

        await message.channel.send(response);
    }
}
