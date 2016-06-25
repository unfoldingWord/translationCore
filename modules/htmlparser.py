
def run():
	import urllib.request, sys

	BOOK_IDENTIFIER = CHAPTER_IDENTIFIER = '<td class="name">'
	BOOK_END_IDENTIFIER = CHAPTER_END_IDENTIFIER = '</td>'
	BASE_LINK = 'https://git.door43.org'

	htmlString = urllib.request.urlopen('https://git.door43.org/Door43/tn-en').read()
	# print(htmlString)
	htmlString = str(htmlString, 'utf-8')

	bookNames = dict()

	debug_limit = 1; #purely for debugging

	def addBook(bookAbr, link=None):
		if bookAbr != '' and bookAbr.find('md') == -1: 
			# make sure we don't add emptry string
			# or the readme or license, which those
			# contain '.md'
			bookNames[bookAbr] = link

	def printBookNames():
		for key in bookNames:
			print(key + ': ' + str(bookNames[key]))

	# print(type(htmlString))
	def getBookNames():
		current_limit = 0
		index = 0
		while (index != -1 and (debug_limit <= 0 or (debug_limit > 0 and current_limit <= debug_limit))):
			index = htmlString.find(BOOK_IDENTIFIER, index)
			endIndex = htmlString.find(BOOK_END_IDENTIFIER, index)

			bookString = htmlString[index : endIndex]
			hrefIndex = bookString.find('href')
			linkIndex = hrefIndex + len('href') +  2 #account for '=' and "
			endLinkIndex = bookString.find('"', linkIndex)

			bookLink = bookString[linkIndex : endLinkIndex]
			bookNameIndex = bookLink.rfind('/') + 1
			bookName = bookLink[bookNameIndex:]
			addBook(bookName, bookLink)
			index = endIndex
			current_limit += 1
		

	def getBookChapters(book):
		current_limit = 0
		# for bookKey in bookNames:
		bookKey = book
		url = BASE_LINK + bookNames[bookKey]
		# print('URL: ' + url)
		# print('Book: ' + bookKey)
		bookHtml = urllib.request.urlopen(url).read()
		bookHtml = str(bookHtml, 'utf-8')
		chapters = dict()
		index = 0
		while (index != -1):
			index = bookHtml.find(BOOK_IDENTIFIER, index)
			endIndex = bookHtml.find(BOOK_END_IDENTIFIER, index)

			chapterString = bookHtml[index : endIndex]
			hrefIndex = chapterString.find('href')
			linkIndex = hrefIndex + len('href') +  2 #account for '=' and "
			endLinkIndex = chapterString.find('"', linkIndex)

			chapterLink = chapterString[linkIndex : endLinkIndex]
			chapterNumberIndex = chapterLink.rfind('/') + 1
			chapterNumber = chapterLink[chapterNumberIndex:]
			chapters[chapterNumber] = chapterLink
			index = endIndex
		link = bookNames[bookKey]
		bookNames[bookKey] = dict()
		bookNames[bookKey]['link'] = link
		bookNames[bookKey]['chapters'] = chapters
		if '' in chapters:
			del chapters['']

		current_limit += 1
		# if (current_limit > debug_limit and debug_limit > 0):
			# break

	def getVerses(book):
		bookKey = book
		# for bookKey in bookNames:
		current_limit = 0
		for chapter in bookNames[bookKey]['chapters']:

			# print('Chapter: ' + chapter)
			verses = dict()
			currentChapterUrl = bookNames[bookKey]['chapters'][chapter]
			chapterUrl = BASE_LINK + bookNames[bookKey]['chapters'][chapter]
			# print('Verse URL: ' + chapterUrl)
			chapterHtml = urllib.request.urlopen(chapterUrl).read()
			chapterHtml = str(chapterHtml, 'utf-8')
			index = 0
			while (index != -1):
				index = chapterHtml.find(CHAPTER_IDENTIFIER, index)
				endIndex = chapterHtml.find(CHAPTER_END_IDENTIFIER, index)

				verseString = chapterHtml[index : endIndex]
				hrefIndex = verseString.find('href')
				linkIndex = hrefIndex + len('href') +  2 #account for '=' and "
				endLinkIndex = verseString.find('"', linkIndex)

				verseLink = verseString[linkIndex : endLinkIndex]
				verseNumberIndex = verseLink.rfind('/') + 1
				verseNumber = verseLink[verseNumberIndex:]
				verses[verseNumber] = verseLink
				index = endIndex
			bookNames[bookKey]['chapters'][chapter] = dict()
			# currentChapterDict = bookNames[bookKey]['chapters'][chapter]
			# currentChapterDict['link'] = currentChapterUrl
			# currentChapterDict['verses'] = verses
			bookNames[bookKey]['chapters'][chapter]['link'] = currentChapterUrl
			bookNames[bookKey]['chapters'][chapter]['verses'] = verses
			if '' in bookNames[bookKey]['chapters'][chapter]:
				del bookNames[bookKey]['chapters'][chapter]['']
			if '' in verses:
				del verses['']

			current_limit += 1
			# 	 if (debug_limit > 0 and current_limit >= debug_limit):
				# break

	def outputJSON():
		outputString = ''
		outputString += '{\n\t'
		for book in bookNames:
			if (type(bookNames[book]) != dict):
				# print('Book: ' + str(book) + ' type: ' + str(type(bookNames[book])));
				continue
			outputString += '"' + book + '"' + ': '
			outputString += '{\n'
			chapterIndex = 0
			
			for chapter in bookNames[book]['chapters']:
				outputString += '\t\t' + '"' + chapter + '"' + ': '
				outputString += '{\n'
				verseIndex = 0

				for verse in bookNames[book]['chapters'][chapter]['verses']:
					verseURL = BASE_LINK + bookNames[book]['chapters'][chapter]['verses'][verse].replace('src', 'raw')
					outputString += '\t\t\t' + '"' + verse + '"' + ': "' + \
						str(urllib.request.urlopen(verseURL).read(), 'utf-8') + '"' + \
						('' if verseIndex == len(bookNames[book]['chapters'][chapter]['verses']) - 1 else ',') + '\n'
					verseIndex += 1
				
				outputString += '\t\t}' + ('' if chapterIndex == len(bookNames[book]['chapters']) - 1 else ',') + '\n'
				chapterIndex += 1

			outputString += '\t}\n'
		outputString += '}\n'
		sys.stdout.write(outputString)


	getBookNames()
	getBookChapters('jon')
	getVerses('jon')
	outputJSON()

	# book = bookNames.__iter__().__next__()
	# # print(str(bookNames[book]))
	# book = bookNames[book]
	# # print(str(type(book)))

	# # print(str(book['chapters']))
	# # print(str(type(book['chapters']['02'])))
	# # print("Book['chapters']['02']: " + str(book['chapters']['02']))
	# # print(str(type(book['chapters']['02']['verses'])))
	# verse = book['chapters']['02']['verses'].__iter__().__next__()
	# verseURL = book['chapters']['02']['verses'][verse]
	# verseURL = verseURL.replace('src', 'raw')
	# # print('verseURL: ' + BASE_LINK + verseURL)
	# verseHTML = urllib.request.urlopen(BASE_LINK + verseURL).read()
	# # print(str(verseHTML, 'utf-8'))
	# # return str(verseHTML, 'utf-8')

if __name__ == "__main__":
	run()




