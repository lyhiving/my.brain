<?php
if (!isset($_SESSION['logged']) || !$_SESSION['logged']){
    header("Location: login.php");
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>my.brain</title>
		<link href="css/main.css" media="all" rel="stylesheet" type="text/css">
		<link href="css/custom-theme/jquery-ui-1.7.2.custom.css" media="all" rel="stylesheet" type="text/css">
		
		<script type="text/javascript" src="js/jquery.js"></script>
		<script type="text/javascript" src="js/jqueryTools/jquery.tools.min.js"></script>
		<!--<script type="text/javascript" src="js/jqueryUI/jquery-ui.js"></script>  -->
		<script type="text/javascript" src="js/jqueryUI/jquery-ui-1.7.2.custom.min.js"></script>  
		<!--<script type="text/javascript" src="js/jqueryUI/jquery.effects.highlight.js"></script>  -->
		<script type="text/javascript" src="js/jquery.corner.js"></script>  
		<script type="text/javascript" src="js/main.js"></script>
		<script type="text/javascript" src="js/tooltips.js"></script>
	</head>
	<body>
		<div id="page">
			<div id="header">
				<div id="title">my.brain</div>
			</div>
			<div id="memoDiv">
				<textarea id="memo" class="smallText"><?php echo $content['memo'] ?></textarea>
				<p id="save_memo">
					<button type="button" onclick="writeMemoToDb()">Enregistrer</button>
					<span id="message_memo">
						Last saved: <?php echo $content["memo_date"];?>
					</span>
				</p>
			</div>
			<div id="entriesDiv">
				<?php for ($i=0; $i<3; $i++):?>
					<div id="col<?php echo $i;?>" class="column_div">
						<?php 
						foreach($content['entry_lists'] as $entry_list): 
							if($entry_list->getCol() == $i):
						?>
								<div class="entryList">	  
									<div class="entryTitle">
										<table>
											<tr name="<?php echo $entry_list->getId();?>">
												<td class="tdListTitle">
													<a href="#"><?php echo $entry_list->getTitle(); ?></a>
												</td>  
												<td class="iconCell">
													<a class="iconCell newEntry" href="#">
														<img class="entryIcon" src="images/add.png" alt="add"/>
													</a>
												</td>											
												<td class="iconCell">
													<a class="iconCell editList" href="#">
														<img class="entryIcon" src="images/edit.png" alt="edit"/>
													</a>
												</td>						
											</tr>
											<?php 
											if ($entry_list->getCollapsed()){
											?>
												<tr style="display:none;">
											<?php 
											}else{
											?>
												<tr>
											<?php 
											}
											?>
												<td colspan=4 class="tags">
												<?php
													$tags = $entry_list->getTagsEntries();
													if ($tags):
														sort($tags);
														foreach ($tags as $tag):
															?>
															<span class="selected tag_header">
															<?php
															echo $tag." ";
															?>
															</span>
															<?php
														endforeach;
													endif;
												?>
													<span class="switch_header">
														all
													</span>
													<span class="switch_header">
														none
													</span>
													<!--
													<span class="switch_header">
														<img class="eye" src="images/eye.png" alt="eye"/>
													</span>													
													-->
												</td>
											</tr>
										</table>  
									</div>    
									<?php 
									if ($entry_list->getCollapsed()){
									?>
										<div class="entryContent" style="display:none;">
									<?php 
									}else{
									?>
										<div class="entryContent">
									<?php 
									}
									?>
										<div class="accordion" id="<?php echo $entry_list->getId()?>">
											<?php foreach($entry_list->getEntries() as $entry): ?>
												<h3 class="customAccordion <?php echo $entry->getId()?>"><a href="#"><?php echo $entry->getName() ?></a></h3>
												<div class="entryBody smallText <?php echo $entry->getId()?>" name="<?php echo $entry->getId()?>">								
													<?php if($entry->getUrl()):?>
														<a class="url" href="<?php echo $entry->getUrl();?>">
															<?php echo shortenUrl($entry->getUrl(), 30);?>
														</a>
													<?php endif;?>
													<div style='float:right'>
														<a class="iconCell" href="zoom_popup.php?id_entry=<?php echo $entry->getId();?>" title="<?php echo $entry->getName();?>" rel="#overlay"> 
															<img class="entryIcon" src="images/zoom.png" alt="zoom"/>
														</a>
														<a class="iconCell editEntry" href="#">
															<img class="entryIcon" src="images/edit.png" alt="edit"/>
														</a>
														<a class="iconCell deleteEntry" href="#">
															<img class="entryIcon" src="images/delete.png" alt="delete"/>
														</a>
													</div>

													<div class="entryTags">
														<?php 
														$tags = $entry->getTags();
														if ($tags):
															foreach ($tags as $tag):
																?>
																<span><?php echo $tag;?></span>
																<?php
															endforeach;
														endif;
														?>
													</div>
													<div class="entryDetails">
														<?php echo $entry->getDetails();?>
													</div>
												</div>
											<?php endforeach; ?>
										</div>
									</div>
								</div>
							<?php endif; ?>
						<?php endforeach; ?>
					</div>
				<?php endfor; ?>
			</div>
		</div>
	</body>
</html>		
<script type="text/javascript">
	$(document).ready(bindEvents());
</script>