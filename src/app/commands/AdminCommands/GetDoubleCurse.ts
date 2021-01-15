import {Command, CommandMessage, Description, Guard} from "@typeit/discord";
import {NotBotMessage} from "../../guards/NotBot";
import {IsAdmin} from "../../guards/IsAdmin";
import {curseService} from "../../services/CurseService";
import {MessageEmbed} from "discord.js";
import {DEFAULT_COLOR} from "../../constants";

type WordCount = {
    word: string,
    count: number
}

export abstract class GetDoubleCurse {

    @Command("doubleCurse")
    @Description("Admins only. Get double cursewords")
    @Guard(NotBotMessage, IsAdmin)
    calculateDoubleCurses(message: CommandMessage): void {
        const response = new MessageEmbed().setTitle("Double words are").setDescription("These words are double or include other words. Remove them for better performance. Fuck is equal to fucker").setColor(DEFAULT_COLOR);
        curseService.loadWords();
        const doubleWords: WordCount[] = []

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

        message.channel.send(response);
    }
}
