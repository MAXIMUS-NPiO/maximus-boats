"""Optional Playwright QA of the actual built document; no external traffic or emails.
Run after npm run build. Python + Playwright + a Chromium binary required.
"""
from pathlib import Path
import json,base64,re,mimetypes,argparse
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
def document(locale):
    html=(ROOT/'dist'/locale/'index.html').read_text()
    css=re.search(r'<link rel="stylesheet" href="([^"]+)">',html).group(1)
    html=html.replace(f'<link rel="stylesheet" href="{css}">','<style>'+(ROOT/'dist'/css.lstrip('/')).read_text()+'</style>')
    html=re.sub(r'<script type="module" src="[^"]+"></script>','',html)
    for p in (ROOT/'public/media').iterdir():
        html=html.replace('/media/'+p.name,'data:'+mimetypes.guess_type(p.name)[0]+';base64,'+base64.b64encode(p.read_bytes()).decode())
    paths=['shared/inquiry.js','src/client/modules/navigation.js','src/client/modules/tabs.js','src/client/modules/dialogs.js','src/client/modules/enquiry.js','src/client/modules/gallery.js','src/client/modules/atmosphere.js','src/client/main.js']
    js='\n'.join(re.sub(r'^import .+?;\s*','',(ROOT/x).read_text(),flags=re.M).replace('export ','') for x in paths)
    return html.replace('</body>','<script type="module">'+js+'</script></body>')
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--chromium',default='/usr/bin/chromium');parser.add_argument('--output',default=str(ROOT/'artifacts'));a=parser.parse_args();out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
    report={'method':'Built HTML and exact source media inlined into an in-memory Chromium document; live provider delivery not executed.','widths':[],'pageErrors':[],'checks':[]}
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=a.chromium,headless=True,args=['--no-sandbox'])
        for locale in ['ru','en']:
            page=b.new_page(viewport={'width':1440,'height':1000});page.emulate_media(reduced_motion='reduce');page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
            page.set_content(document(locale),wait_until='load')
            page.evaluate("""async()=>{const a=Array.from(document.images);a.forEach(i=>i.loading='eager');await Promise.all(a.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r})));}""")
            for width in [320,390,768,1024,1440,1920]:
                page.set_viewport_size({'width':width,'height':1000})
                for model in ['vanuatu','storm','family','hunter']:
                    page.locator('#tab-'+model).click();assert page.locator('#panel-'+model).is_visible()
                    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(locale,width,model)
                report['widths'].append({'locale':locale,'width':width,'fourTabs':'pass','overflow':False})
            page.locator('#tab-vanuatu').click();page.locator('#tab-vanuatu').focus();page.keyboard.press('ArrowRight');assert page.locator('#tab-storm').get_attribute('aria-selected')=='true';page.keyboard.press('Home')
            page.locator('#playVideo').click();assert page.locator('#videoDialog').is_visible();page.keyboard.press('Escape');assert not page.locator('#videoDialog').is_visible()
            page.locator('#copyEnquiry').click();assert page.locator('#fullName').get_attribute('aria-invalid')=='true'
            page.locator('#fullName').fill('Test User');page.locator('#email').fill('user@example.test');page.locator('#message').fill('Test project <script>window.bad=true</script>');page.locator('[name=consent]').check();page.locator('#copyEnquiry').click();assert '<script>' in page.locator('#preparedMessage').input_value();assert page.evaluate('window.bad') is None
            page.locator('#enquiryForm').evaluate('f=>f.reset()');page.locator('#preparedMessage').evaluate('e=>{e.hidden=true;e.value=""}');page.locator('#formStatus').evaluate('e=>e.textContent=""')
            page.set_viewport_size({'width':390,'height':844});page.locator('#menuToggle').click();assert 'open' in page.locator('#mobileNav').get_attribute('class');page.keyboard.press('Escape');assert 'open' not in page.locator('#mobileNav').get_attribute('class')
            page.evaluate('scrollTo({top:0,behavior:"instant"})');page.screenshot(path=str(out/f'{locale}-mobile-first.png'));page.screenshot(path=str(out/f'{locale}-mobile-full.png'),full_page=True)
            page.set_viewport_size({'width':1440,'height':1000});page.evaluate('scrollTo({top:0,behavior:"instant"})');page.screenshot(path=str(out/f'{locale}-desktop-first.png'));page.screenshot(path=str(out/f'{locale}-desktop-full.png'),full_page=True)
            assert page.evaluate('Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)')
            assert not re.search('[★☆✦✧✩✪✫✬✭✮✯✰]',page.inner_text('body'))
            report['checks'].append({'locale':locale,'keyboardTabs':True,'videoDialog':True,'formValidation':True,'safePlainTextReview':True,'mobileMenu':True,'sourceImagesDecoded':True,'decorativeStars':False});page.close()
        b.close()
    assert not report['pageErrors'],report['pageErrors'];report['result']='PASS';(ROOT/'docs/browser-qa.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
if __name__=='__main__':main()
